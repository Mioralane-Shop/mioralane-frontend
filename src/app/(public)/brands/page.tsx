import type { Metadata } from "next";
import { BrandGrid } from "@/components/brands/brand-grid";
import { buildPageMetadata } from "@/lib/seo/metadata";
import type { Brand } from "@/types/brand";

/**
 * The brand index — a **server** component.
 *
 * A brand index exists to be crawled, and a client-rendered grid hands a crawler
 * an empty document: the links to `/shop?brand=…` would not exist in the HTML.
 * Rendering on the server also means no client JavaScript and no loading state
 * for what is a static list.
 *
 * The navbar and the mobile drawer stay client components reading the same API
 * through `useBrands()` — the two coexist deliberately. They need interactivity
 * (hover, the drawer), this needs to be in the HTML.
 *
 * ## The fetch, and why it is here rather than in a service
 *
 * There is no server-side axios: `src/lib/axios.ts` carries CSRF and Turnstile
 * interceptors that read browser state, so it cannot run on the server. This
 * mirrors `src/lib/seo/data.ts` instead — a plain `fetch` that is deliberately
 * best-effort. `NEXT_PUBLIC_API_URL` unset means no request at all, any failure
 * returns `[]`, and nothing here can throw: a page render must not depend on a
 * reachable API, and `next build` must not either.
 *
 * It lives in this file because the page is its only consumer. A second server
 * caller should move it to `src/lib/brands.ts` rather than import from a page.
 *
 * ## Why the fetch is uncached
 *
 * `no-store`, not ISR. The response was cached for an hour, which let this page
 * keep listing brands that had already been deleted — logo and all — for up to 60
 * minutes, while the navbar dropdown and the marquee dropped them immediately. The
 * detail is on the fetch itself.
 */

/** Abort a page fetch after this long; a render must never hang. */
const FETCH_TIMEOUT_MS = 4000;

/** Read lazily so a build with no env configured is still a successful build. */
function apiBase(): string {
  return (process.env.NEXT_PUBLIC_API_URL ?? "").replace(/\/+$/, "");
}

/**
 * Shape check on the way in. The API is trusted, but a proxy or an older
 * deployment answering with something else should drop the row rather than crash
 * the page on `brand.name` being undefined.
 */
function isBrand(value: unknown): value is Brand {
  const candidate = value as Partial<Brand> | null | undefined;

  return (
    !!candidate &&
    typeof candidate === "object" &&
    typeof candidate.id === "string" &&
    typeof candidate.name === "string" &&
    candidate.name.length > 0
  );
}

/** Visible brands in display order, or `[]`. Never throws. */
async function getBrands(): Promise<Brand[]> {
  const base = apiBase();

  if (!base) {
    return [];
  }

  try {
    const response = await fetch(`${base}/brands`, {
      // `no-store`, deliberately, rather than the hour-long ISR window this used to
      // use (`next: { revalidate: 3600 }`). With that cache in place, a brand
      // deleted in the admin — or straight from the database — kept rendering here,
      // with its logo, for up to 60 minutes, while the navbar dropdown and the
      // homepage marquee (client components reading `useBrands()`) dropped it at
      // once. The page contradicted its own header.
      //
      // The cost is one API call per view instead of one per hour, which is close
      // to free in practice: the navbar already calls this same endpoint from the
      // browser on every page view, so a cached server render was not saving
      // anything the page did not spend elsewhere anyway. For a hand-curated list
      // that changes whenever an admin edits it, being correct beats being cached.
      //
      // Trade-off, stated plainly: this page can no longer be served from the CDN as
      // a static document, so `next build` reports it as dynamic. If that ever
      // matters, the fix is on-demand revalidation triggered by the admin's brand
      // writes — not a longer or shorter TTL, which only narrows the window in which
      // the page is wrong.
      cache: "no-store",
      signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
      headers: { Accept: "application/json" },
    });

    if (!response.ok) {
      return [];
    }

    const payload = (await response.json()) as { brands?: unknown };

    return Array.isArray(payload.brands) ? payload.brands.filter(isBrand) : [];
  } catch {
    return [];
  }
}

export async function generateMetadata(): Promise<Metadata> {
  // No data needed: the title and description are the same whether the grid has
  // rows or not, so metadata cannot fail because the API is down.
  return buildPageMetadata({
    title: "Brands",
    description:
      "Browse every Korean skincare brand Mioralane stocks — from COSRX, Beauty of Joseon and SKIN1004 to the smaller houses we import, all checked for authenticity.",
    path: "/brands",
  });
}

export default async function BrandsPage() {
  const brands = await getBrands();

  return (
    <div className="mx-auto max-w-[1200px] px-6 py-12">
      <header className="max-w-3xl">
        <span className="text-xs font-bold uppercase tracking-widest text-accent">
          Brands
        </span>
        <h1 className="mt-3 text-3xl font-serif font-medium text-ink sm:text-4xl">
          Every brand we carry
        </h1>
        <p className="mt-4 leading-relaxed text-ink/60">
          Mioralane stocks authentic Korean skincare from the houses you know and
          the ones worth knowing. Pick a brand to see everything we carry from it.
        </p>
      </header>

      <div className="mt-10">
        <BrandGrid brands={brands} />
      </div>
    </div>
  );
}
