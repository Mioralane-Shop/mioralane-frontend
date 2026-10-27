/**
 * SEO Phase 1 — the XML sitemap (`/sitemap.xml`).
 *
 * Contents are derived, not hard-coded: `buildSitemapEntries` owns the rules and
 * `getSeoCatalog` supplies the catalogue (live API, or the bundled constants when
 * no API is configured — which is what a CI build looks like). `revalidate` keeps
 * it warm without a redeploy.
 *
 * Relative `.ts` imports are required because `scripts/verify-seo.ts` imports this
 * module directly under Node's type stripping.
 */
import type { MetadataRoute } from "next";
import { getSeoBlogPosts, getSeoCatalog } from "../lib/seo/data.ts";
import { buildSitemapEntries } from "../lib/seo/sitemap.ts";

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const { products, combos } = await getSeoCatalog();
  const posts = await getSeoBlogPosts();

  return buildSitemapEntries({
    products,
    combos,
    posts,
  });
}
