/**
 * SEO Phase 1 — `/robots.txt`.
 *
 * Everything is crawlable except the API surface, Next's build output and the
 * admin path (which is a separate deployment, but is excluded here so a
 * mis-routed host cannot expose it). The sitemap is advertised so crawlers find
 * the derived catalogue without guessing.
 *
 * The relative `.ts` import is required by `scripts/verify-seo.ts`, which imports
 * this module under Node's type stripping.
 */
import type { MetadataRoute } from "next";
import { SITE_ORIGIN } from "../lib/seo/urls.ts";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/api/", "/_next/", "/admin/"],
      },
    ],
    sitemap: `${SITE_ORIGIN}/sitemap.xml`,
    host: SITE_ORIGIN,
  };
}
