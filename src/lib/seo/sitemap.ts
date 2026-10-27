/**
 * SEO — sitemap entry builder.
 *
 * Kept separate from `src/app/sitemap.ts` so it is a pure, network-free function:
 * the route file's only job is to gather data, and the shape/priority rules can
 * be exercised by `scripts/verify-seo.ts` without a server.
 *
 * The explicit `.ts` extensions are required by Node's type stripping (see
 * `tsconfig.json` → `allowImportingTsExtensions`).
 */
import { absoluteUrl } from "./urls.ts";

export type ChangeFrequency =
  | "always"
  | "hourly"
  | "daily"
  | "weekly"
  | "monthly"
  | "yearly"
  | "never";

export interface SitemapEntry {
  url: string;
  lastModified: Date;
  changeFrequency: ChangeFrequency;
  priority: number;
}

export interface SitemapSource {
  slug: string;
  /** ISO date (`2024-01-15`) or a human date (`March 12, 2026`); unparsable → `now`. */
  createdAt?: string;
}

export interface SitemapInput {
  products: readonly SitemapSource[];
  combos: readonly SitemapSource[];
  posts: readonly SitemapSource[];
  /** Injectable clock, so the harness can assert exact dates. */
  now?: Date;
}

/** Every indexable, non-row route on the storefront. */
export const STATIC_ROUTES: ReadonlyArray<{
  path: string;
  changeFrequency: ChangeFrequency;
  priority: number;
}> = [
  { path: "/", changeFrequency: "daily", priority: 1 },
  { path: "/shop", changeFrequency: "daily", priority: 0.9 },
  { path: "/combo", changeFrequency: "weekly", priority: 0.8 },
  { path: "/brands", changeFrequency: "weekly", priority: 0.8 },
  { path: "/blog", changeFrequency: "weekly", priority: 0.6 },
  { path: "/skincare-quiz", changeFrequency: "monthly", priority: 0.6 },
  { path: "/about", changeFrequency: "monthly", priority: 0.5 },
  { path: "/faq", changeFrequency: "monthly", priority: 0.5 },
  { path: "/authenticity", changeFrequency: "monthly", priority: 0.4 },
  { path: "/delivery", changeFrequency: "monthly", priority: 0.4 },
  { path: "/returns", changeFrequency: "monthly", priority: 0.4 },
  { path: "/track-order", changeFrequency: "monthly", priority: 0.3 },
  { path: "/contact", changeFrequency: "monthly", priority: 0.3 },
  { path: "/privacy", changeFrequency: "yearly", priority: 0.2 },
  { path: "/terms", changeFrequency: "yearly", priority: 0.2 },
];

/** A parseable date, or `fallback` — `new Date("garbage")` is an Invalid Date. */
function parseDate(value: string | undefined, fallback: Date): Date {
  if (!value) {
    return fallback;
  }

  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? fallback : parsed;
}

/**
 * The full sitemap: static routes, then catalogue, then content. Later entries
 * never shadow earlier ones — `absoluteUrl` output is de-duplicated by URL so a
 * combo slug that also appears as a product cannot be listed twice.
 */
export function buildSitemapEntries(input: SitemapInput): SitemapEntry[] {
  const now = input.now ?? new Date();
  const entries: SitemapEntry[] = [];

  for (const route of STATIC_ROUTES) {
    entries.push({
      url: absoluteUrl(route.path),
      lastModified: now,
      changeFrequency: route.changeFrequency,
      priority: route.priority,
    });
  }

  for (const product of input.products) {
    entries.push({
      url: absoluteUrl(`/product/${product.slug}`),
      lastModified: parseDate(product.createdAt, now),
      changeFrequency: "weekly",
      priority: 0.7,
    });
  }

  for (const combo of input.combos) {
    entries.push({
      url: absoluteUrl(`/combo/${combo.slug}`),
      lastModified: parseDate(combo.createdAt, now),
      changeFrequency: "weekly",
      priority: 0.7,
    });
  }

  for (const post of input.posts) {
    entries.push({
      url: absoluteUrl(`/blog/${post.slug}`),
      lastModified: parseDate(post.createdAt, now),
      changeFrequency: "monthly",
      priority: 0.5,
    });
  }

  const seen = new Set<string>();
  return entries.filter((entry) => {
    if (seen.has(entry.url)) {
      return false;
    }

    seen.add(entry.url);
    return true;
  });
}
