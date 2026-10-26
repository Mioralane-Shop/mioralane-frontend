/**
 * SEO — shared `Metadata` fragments.
 *
 * Every route exports the same handful of fields (title, description, canonical,
 * Open Graph, Twitter card). Building them by hand in each `generateMetadata`
 * is how one page quietly ends up without a canonical, so they are built here
 * instead and the harness can assert the shape once.
 *
 * Relative `.ts` imports keep this module loadable by `scripts/verify-seo.ts`.
 */
import type { Metadata } from "next";
import { SITE_NAME } from "../../constants/site.ts";
import { absoluteUrl } from "./urls.ts";

/**
 * The social card — the static asset at `public/og_default.png`.
 *
 * It replaced a generated card (`app/opengraph-image.tsx`, since deleted). Both
 * could not coexist coherently: the file convention auto-injects `og:image` for
 * any segment that does not set its own, so some routes would have shown the
 * generated card and others this one. One card, set explicitly everywhere.
 *
 * `width`/`height` are the file's **real** dimensions, not a nominal 1200×630 —
 * `verify:seo` parses the PNG header and fails if these drift from the bytes.
 * The ratio is 1.9086, within 0.2% of Open Graph's 1.9048, so platforms scale it
 * correctly; a mismatch here is what makes a scraper render a wrong-sized preview.
 */
export const DEFAULT_OG_IMAGE = {
  url: "/og_default.png",
  width: 1733,
  height: 908,
  alt: `${SITE_NAME} — Korean skincare, delivered in Bangladesh`,
} as const;

export interface PageMetadataInput {
  title: string;
  description: string;
  /** Site-relative path; becomes the canonical URL. */
  path: string;
  /** Candidate social images (site-relative or absolute). Falls back to the default. */
  images?: readonly string[];
  openGraphType?: "website" | "article";
  /** Transactional pages (cart, checkout, auth) must not be indexed. */
  noIndex?: boolean;
  /**
   * Emit the title verbatim. Needed by the homepage, whose already contains the
   * brand — otherwise the root layout's `%s | Mioralane` template appends it twice.
   */
  absoluteTitle?: boolean;
}

export function buildPageMetadata(input: PageMetadataInput): Metadata {
  const images = (input.images ?? []).filter((url): url is string => !!url && url.trim().length > 0);
  const absoluteImages = images.map((url) => absoluteUrl(url));
  const openGraphType = input.openGraphType ?? "website";

  return {
    title: input.absoluteTitle ? { absolute: input.title } : input.title,
    description: input.description,
    alternates: { canonical: input.path },
    openGraph: {
      type: openGraphType,
      title: input.title,
      description: input.description,
      url: absoluteUrl(input.path),
      siteName: SITE_NAME,
      images: absoluteImages.length
        ? absoluteImages.map((url) => ({ url, alt: input.title }))
        : [DEFAULT_OG_IMAGE],
    },
    twitter: {
      card: "summary_large_image",
      title: input.title,
      description: input.description,
      images: absoluteImages.length ? absoluteImages : undefined,
    },
    ...(input.noIndex ? { robots: { index: false, follow: true } } : {}),
  };
}
