/**
 * SEO — server-side data access for metadata, JSON-LD and the sitemap.
 *
 * The storefront renders its catalogue on the client (React Query over
 * `src/services/*`), so nothing about a product is known on the server by
 * default. `generateMetadata` and JSON-LD, however, only exist if they are in
 * the *server* HTML — a crawler that does not execute JavaScript never sees a
 * client-rendered `<title>`.
 *
 * So this module re-reads the same public API on the server. It is deliberately
 * best-effort:
 *
 *   - `NEXT_PUBLIC_API_URL` unset (CI, a fresh checkout) → no request at all;
 *   - a slow or failing API → a bounded timeout, then `null`, never a throw.
 *
 * `generateMetadata` must not be able to fail a page render, and `next build`
 * must not require a reachable API, so every path here degrades to the bundled
 * constants (`CATALOG_2026_PRODUCTS`, `DUMMY_PRODUCTS`) or to generic metadata.
 *
 * The explicit `.ts` extensions are required because `scripts/verify-seo.ts`
 * imports this chain under Node's type stripping.
 */
import { cache } from "react";
import type { Product } from "@/types/product";
import { CATALOG_2026_PRODUCTS } from "../../constants/catalog-2026.ts";
import { DUMMY_PRODUCTS } from "../../constants/site.ts";
import { BLOG_POSTS } from "../../constants/blog.ts";

/** Abort a metadata fetch after this long; a page render must never hang. */
const FETCH_TIMEOUT_MS = 4000;

/** How long a successful metadata fetch stays warm. */
const REVALIDATE_SECONDS = 3600;

/** Max rows requested when building the sitemap. */
const CATALOG_PAGE_SIZE = 200;

type NextFetchInit = RequestInit & { next?: { revalidate?: number } };

/** Read lazily so a harness can clear the variable before calling in. */
function apiBase(): string {
  return (process.env.NEXT_PUBLIC_API_URL ?? "").replace(/\/+$/, "");
}

function isProduct(value: unknown): value is Product {
  const candidate = value as Partial<Product> | null | undefined;
  return (
    !!candidate &&
    typeof candidate === "object" &&
    typeof candidate.slug === "string" &&
    candidate.slug.length > 0 &&
    typeof candidate.name === "string" &&
    candidate.name.length > 0
  );
}

/** GET a JSON document, or `null` for any failure. Never throws. */
async function fetchJson(path: string): Promise<unknown | null> {
  const base = apiBase();
  if (!base) {
    return null;
  }

  try {
    const init: NextFetchInit = {
      headers: { accept: "application/json" },
      signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
      next: { revalidate: REVALIDATE_SECONDS },
    };
    const response = await fetch(`${base}${path}`, init);
    if (!response.ok) {
      return null;
    }

    return await response.json();
  } catch {
    return null;
  }
}

/** Everything the storefront ships, combos included. */
const LOCAL_PRODUCTS: readonly Product[] = [...CATALOG_2026_PRODUCTS, ...DUMMY_PRODUCTS];

function isCombo(product: Product): boolean {
  return product.itemType === "combo" || product.category === "combo";
}

function dedupeBySlug(products: readonly Product[]): Product[] {
  const seen = new Map<string, Product>();
  for (const product of products) {
    if (!seen.has(product.slug)) {
      seen.set(product.slug, product);
    }
  }

  return Array.from(seen.values());
}

/** Bundled non-combo products — the offline fallback for `/product/[slug]`. */
export const LOCAL_CATALOG_PRODUCTS: readonly Product[] = dedupeBySlug(
  LOCAL_PRODUCTS.filter((product) => !isCombo(product)),
);

/** Bundled combo products — the offline fallback for `/combo/[slug]`. */
export const LOCAL_CATALOG_COMBOS: readonly Product[] = dedupeBySlug(
  LOCAL_PRODUCTS.filter(isCombo),
);

function asProduct(payload: unknown, key: "product" | "combo"): Product | null {
  const value = (payload as Record<string, unknown> | null)?.[key];
  return isProduct(value) ? value : null;
}

export type ProductLookup =
  | { status: "found"; product: Product }
  | { status: "missing" }
  | { status: "unavailable" };

type DetailedResponse =
  | { status: "ok"; payload: unknown }
  | { status: "missing" }
  | { status: "unavailable" };

/** Like `fetchJson`, but keeps a definitive 404 apart from every other failure. */
async function fetchJsonDetailed(path: string): Promise<DetailedResponse> {
  const base = apiBase();
  if (!base) {
    return { status: "unavailable" };
  }

  try {
    const init: NextFetchInit = {
      headers: { accept: "application/json" },
      signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
      next: { revalidate: REVALIDATE_SECONDS },
    };
    const response = await fetch(`${base}${path}`, init);
    if (response.status === 404) {
      return { status: "missing" };
    }

    if (!response.ok) {
      return { status: "unavailable" };
    }

    return { status: "ok", payload: await response.json() };
  } catch {
    return { status: "unavailable" };
  }
}

/**
 * A product, plus why it is absent when it is.
 *
 * `getProductBySlug` flattens "the API answered 404" and "the request failed"
 * into `null`, which is right for metadata but wrong for an HTTP status: a
 * deleted product must answer 404, while a transient outage must not. The
 * product layout uses this so only a definitive answer becomes `notFound()`.
 *
 * Wrapped in `cache()`: `generateMetadata` and the segment layout both ask for
 * the same slug during one render, and React's request-scoped cache collapses
 * that into a single API call.
 */
export const lookupProductBySlug = cache(async (slug: string): Promise<ProductLookup> => {
  if (!slug) {
    return { status: "missing" };
  }

  const result = await fetchJsonDetailed(`/products/${encodeURIComponent(slug)}`);
  if (result.status === "ok") {
    const product = asProduct(result.payload, "product");
    if (product && !isCombo(product)) {
      return { status: "found", product };
    }
  }

  const local = LOCAL_CATALOG_PRODUCTS.find((product) => product.slug === slug);
  if (local) {
    return { status: "found", product: local };
  }

  return result.status === "missing" ? { status: "missing" } : { status: "unavailable" };
});

/** A single product, API first, bundled constants second. */
export async function getProductBySlug(slug: string): Promise<Product | null> {
  const result = await lookupProductBySlug(slug);
  return result.status === "found" ? result.product : null;
}

/** A single combo, API first, bundled constants second. */
export async function getComboBySlug(slug: string): Promise<Product | null> {
  if (!slug) {
    return null;
  }

  const fromApi = asProduct(await fetchJson(`/combos/${encodeURIComponent(slug)}`), "combo");
  if (fromApi) {
    return fromApi;
  }

  return LOCAL_CATALOG_COMBOS.find((combo) => combo.slug === slug) ?? null;
}

export interface SeoCatalog {
  products: Product[];
  combos: Product[];
}

interface SeoBlogPost {
  slug: string;
  createdAt?: string;
}

function isBlogSummary(value: unknown): value is { slug: string; publishedAt?: string; createdAt?: string } {
    const candidate = value as { slug?: unknown } | null | undefined;
    return !!candidate && typeof candidate.slug === "string" && candidate.slug.length > 0;
}

/**
 * The blog slugs for the sitemap.
 *
 * Live API when it is reachable; the bundled constants only for the offline CI
 * path — `verify-seo` clears `NEXT_PUBLIC_API_URL` and asserts the blog rows are
 * present. The published blog *pages* never use this fallback.
 */
export async function getSeoBlogPosts(): Promise<SeoBlogPost[]> {
    const payload = await fetchJson("/blog");
    const remote = (payload as { posts?: unknown } | null)?.posts;

    if (Array.isArray(remote)) {
        const posts = remote
            .filter(isBlogSummary)
            .map((post) => ({ slug: post.slug, createdAt: post.publishedAt ?? post.createdAt }));

        if (posts.length > 0) {
            return posts;
        }
    }

    return BLOG_POSTS.map((post) => ({ slug: post.slug, createdAt: post.date }));
}

/**
 * The catalogue as a whole, for the sitemap. Falls back **per collection**, so an
 * API that serves products but not combos still yields a useful sitemap rather
 * than none.
 */
export async function getSeoCatalog(): Promise<SeoCatalog> {
  const [productsPayload, combosPayload] = await Promise.all([
    fetchJson(`/products?limit=${CATALOG_PAGE_SIZE}`),
    fetchJson(`/combos?limit=${CATALOG_PAGE_SIZE}`),
  ]);

  const remoteProducts = (productsPayload as { products?: unknown } | null)?.products;
  const remoteCombos = (combosPayload as { combos?: unknown } | null)?.combos;

  const products = Array.isArray(remoteProducts) ? remoteProducts.filter(isProduct) : [];
  const combos = Array.isArray(remoteCombos) ? remoteCombos.filter(isProduct) : [];

  const resolvedProducts = dedupeBySlug(
    products.filter((product) => !isCombo(product)),
  );
  const resolvedCombos = dedupeBySlug(combos.filter(isCombo));

  return {
    products: resolvedProducts.length ? resolvedProducts : [...LOCAL_CATALOG_PRODUCTS],
    combos: resolvedCombos.length ? resolvedCombos : [...LOCAL_CATALOG_COMBOS],
  };
}
