/**
 * SEO Phase 2 — JSON-LD (schema.org) generators.
 *
 * Pure functions: no React, no Next, no I/O. That is deliberate — it makes them
 * callable from `scripts/verify-seo.ts` under Node's type stripping, where the
 * assertions are about the emitted graph rather than about a page rendering.
 *
 * ## Why `serializeJsonLd` escapes `<`
 *
 * A JSON-LD block is inlined into the document as `<script type="application/ld+json">`.
 * The HTML parser ends *any* script element at the first `</script`, regardless of
 * the element's `type` — so a product description containing `</script><img onerror=…>`
 * would terminate the data block and the remainder would be parsed as markup. Escaping
 * `<` as `\u003c` is valid JSON (\u escaping is part of the spec) and makes the
 * sequence `</script` unrepresentable inside the block.
 *
 * `serializeJsonLd` is the ONLY place a JSON-LD payload may be stringified; the
 * `<JsonLd>` component and this harness both go through it.
 */
import type { Product, ProductMedia } from "@/types/product";
import { SITE_DESCRIPTION, SITE_NAME } from "../../constants/site.ts";
import { SOCIAL_LINKS } from "../../constants/social-links.ts";
import { absoluteUrl, SITE_ORIGIN } from "./urls.ts";

export const SCHEMA = "https://schema.org";

/** schema.org currency for every price on the storefront. */
export const PRICE_CURRENCY = "BDT";

/** A node of a JSON-LD graph. Kept loose on purpose — these are plain objects. */
export type JsonLdNode = Record<string, unknown>;

export interface BreadcrumbItem {
  name: string;
  path: string;
}

export interface FaqEntry {
  question: string;
  answer: string;
}

/**
 * Stringify a JSON-LD graph for inline embedding.
 *
 * `JSON.stringify` alone is not safe for a `<script>` body: it leaves `<`, `>`
 * and `/` untouched, so `</script>` in any string value breaks out of the
 * element. Replacing every `<` with the six-character escape `\u003c` closes
 * that, and `JSON.parse` on the consumer side decodes it back.
 */
export function serializeJsonLd(value: unknown): string {
  return JSON.stringify(value).replace(/</g, "\\u003c");
}

/**
 * Absolute image URLs for a product, primary first, de-duplicated, empties dropped.
 *
 * Exported because the product layout's Open Graph images must be the same list:
 * a card that shows one photo while the JSON-LD advertises another is a mismatch
 * Google reports as an image inconsistency.
 */
export function productImageUrls(product: Product): string[] {
  const media: ProductMedia[] = [...(product.media ?? [])].sort((a, b) => {
    if (Boolean(a.isPrimary) !== Boolean(b.isPrimary)) return a.isPrimary ? -1 : 1;
    return (a.sortOrder ?? 0) - (b.sortOrder ?? 0);
  });

  const candidates = [
    ...media.map((entry) => entry.url),
    ...(product.images ?? []),
    product.hoverImage,
  ].filter((value): value is string => typeof value === "string" && value.trim().length > 0);

  return Array.from(new Set(candidates.map((url) => absoluteUrl(url))));
}

/**
 * The price the detail page shows on load.
 *
 * `page.tsx` renders `sizeOptions[selectedSize].price` starting at index 0 (and
 * falls back to `product.price`), so the Offer must use that same value. Taking
 * the minimum across variants instead could advertise a cheaper size than the
 * one the visitor — and Google's price check — actually lands on.
 */
function displayedPrice(product: Product): number {
  const firstOption = product.sizeOptions?.[0]?.price;
  if (typeof firstOption === "number" && Number.isFinite(firstOption) && firstOption > 0) {
    return firstOption;
  }

  return typeof product.price === "number" && Number.isFinite(product.price) && product.price > 0
    ? product.price
    : 0;
}

/** Stored copy can contain inline HTML; schema.org text must not. */
function plainText(value: string | undefined): string | undefined {
  if (!value) return undefined;
  const text = value.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
  return text.length > 0 ? text : undefined;
}

function schemaAvailability(product: Product): string {
  if (product.availabilityMode === "pre_order") {
    return `${SCHEMA}/PreOrder`;
  }

  const inStock = product.stock > 0 || (product.sizeOptions ?? []).some((option) => option.stock > 0);
  return inStock ? `${SCHEMA}/InStock` : `${SCHEMA}/OutOfStock`;
}

/**
 * `Product` node for a product or combo detail page.
 *
 * `path` defaults to the product route; the combo page passes `/combo/<slug>`
 * so the offer URL points at the page that actually renders it.
 */
export function generateProductJsonLd(
  product: Product,
  options: { path?: string } = {},
): JsonLdNode {
  const path = options.path ?? `/product/${product.slug}`;
  const url = absoluteUrl(path);
  const images = productImageUrls(product);
  const description = plainText(product.longDescription) ?? plainText(product.description);
  // A real SKU only. `product.id` is a database key, not something a merchant or
  // a scraper can reconcile against a supplier, so it is not passed off as one.
  const sku = typeof product.sku === "string" ? product.sku.trim() : "";

  const node: JsonLdNode = {
    "@context": SCHEMA,
    "@type": "Product",
    "@id": `${url}#product`,
    name: product.name,
    description,
    image: images.length ? images : undefined,
    sku: sku.length ? sku : undefined,
    category: product.category,
    brand: { "@type": "Brand", name: product.brand },
    url,
    offers: {
      "@type": "Offer",
      url,
      priceCurrency: PRICE_CURRENCY,
      price: displayedPrice(product).toFixed(2),
      availability: schemaAvailability(product),
      itemCondition: `${SCHEMA}/NewCondition`,
    },
  };

  // An AggregateRating with a zero rating is invalid and gets a manual action, so
  // it is only emitted once real review data exists.
  if (product.rating > 0 && product.reviewCount > 0) {
    node.aggregateRating = {
      "@type": "AggregateRating",
      ratingValue: String(product.rating),
      reviewCount: String(product.reviewCount),
      bestRating: "5",
      worstRating: "1",
    };
  }

  return node;
}

/** `BreadcrumbList` node. Positions are 1-based, as the spec requires. */
export function generateBreadcrumbJsonLd(items: readonly BreadcrumbItem[]): JsonLdNode {
  return {
    "@context": SCHEMA,
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: absoluteUrl(item.path),
    })),
  };
}

/**
 * `Article` input. Deliberately narrow — the blog constants are the only caller.
 */
export interface ArticleInput {
  slug: string;
  title: string;
  description?: string;
  /** Site-relative or absolute. */
  image?: string;
  /** A human-readable date, as the blog constants store it (`March 12, 2026`). */
  date?: string;
}

/**
 * An ISO-8601 timestamp, or `undefined` when the input cannot be parsed.
 *
 * `new Date("garbage").toISOString()` THROWS, so a caller must never pass an
 * unvalidated value straight through.
 */
function isoDate(value: string | undefined): string | undefined {
  if (!value) {
    return undefined;
  }

  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? undefined : parsed.toISOString();
}

/**
 * The publishing Organization, INLINED rather than referenced by `@id` alone.
 *
 * The full `Organization` node lives on the homepage. A bare
 * `{"@id": "…/#organization"}` on a blog post would be a dangling reference —
 * Google resolves `@id` within the document, and this document does not contain
 * that node. The `@id` is still set, so the node is identifiable and merges if the
 * homepage graph is ever inlined here too.
 *
 * `logo` is not decoration: Google's Article guidance requires `publisher.logo`, and
 * an Article without it can be dropped from rich results rather than degraded.
 */
function publisherNode(): JsonLdNode {
  return {
    "@type": "Organization",
    "@id": `${SITE_ORIGIN}/#organization`,
    name: SITE_NAME,
    url: SITE_ORIGIN,
    logo: {
      "@type": "ImageObject",
      url: absoluteUrl("/logo/logo_icon.svg"),
    },
  };
}

/**
 * `BlogPosting` node for a blog post page.
 *
 * `dateModified` mirrors `datePublished` on purpose: the blog constants carry no
 * `updatedAt`, and inventing a modification date is worse than repeating the one
 * date that is actually known. An unparsable `date` is OMITTED rather than guessed.
 */
export function generateArticleJsonLd(input: ArticleInput): JsonLdNode {
  const url = absoluteUrl(`/blog/${input.slug}`);
  const published = isoDate(input.date);
  const image = input.image?.trim() ? absoluteUrl(input.image) : undefined;

  const node: JsonLdNode = {
    "@context": SCHEMA,
    "@type": "BlogPosting",
    "@id": `${url}#article`,
    headline: input.title,
    description: input.description?.trim() || undefined,
    image: image ? [image] : undefined,
    mainEntityOfPage: { "@type": "WebPage", "@id": url },
    url,
    inLanguage: "en",
    author: publisherNode(),
    publisher: publisherNode(),
  };

  if (published) {
    node.datePublished = published;
    node.dateModified = published;
  }

  return node;
}

/**
 * `Organization` node — the site-wide identity Google uses for the knowledge
 * panel. WhatsApp is a messaging link, not a profile, so it is excluded from
 * `sameAs`.
 */
export function generateOrganizationJsonLd(): JsonLdNode {
  return {
    "@context": SCHEMA,
    "@type": "Organization",
    "@id": `${SITE_ORIGIN}/#organization`,
    name: SITE_NAME,
    url: SITE_ORIGIN,
    description: SITE_DESCRIPTION,
    logo: {
      "@type": "ImageObject",
      url: absoluteUrl("/logo/logo_icon.svg"),
    },
    address: {
      "@type": "PostalAddress",
      addressCountry: "BD",
      addressLocality: "Dhaka",
    },
    sameAs: SOCIAL_LINKS.filter((link) => link.icon !== "whatsapp").map((link) => link.href),
  };
}

/**
 * `WebSite` node with a `SearchAction`, which is what enables the sitelinks
 * search box. The target matches what `/shop` actually reads (`?search=`).
 */
export function generateWebSiteJsonLd(): JsonLdNode {
  return {
    "@context": SCHEMA,
    "@type": "WebSite",
    "@id": `${SITE_ORIGIN}/#website`,
    name: SITE_NAME,
    url: SITE_ORIGIN,
    description: SITE_DESCRIPTION,
    inLanguage: "en",
    publisher: { "@id": `${SITE_ORIGIN}/#organization` },
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${absoluteUrl("/shop")}?search={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  };
}

/** `FAQPage` node built from the same list the accordion renders. */
export function generateFaqJsonLd(faqs: readonly FaqEntry[]): JsonLdNode {
  return {
    "@context": SCHEMA,
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
  };
}
