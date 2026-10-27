import type { Metadata } from "next";
import { notFound } from "next/navigation";
import type { Product } from "@/types/product";
import { JsonLd } from "@/components/seo/json-ld";
import { SITE_NAME } from "@/constants/site";
import { productShortName } from "@/lib/product-name";
import { lookupProductBySlug } from "@/lib/seo/data";
import {
  generateBreadcrumbJsonLd,
  generateProductJsonLd,
  productImageUrls,
  type BreadcrumbItem,
} from "@/lib/seo/json-ld";
import { buildPageMetadata } from "@/lib/seo/metadata";
import { decodePathSegment, formatPrice } from "@/lib/utils";

/**
 * SEO for `/product/[slug]`.
 *
 * ## Why this is a `layout.tsx` and not the page
 *
 * `page.tsx` here is `"use client"` — it reads the slug with `useParams()` and
 * fetches the product with React Query. Next forbids exporting metadata from a
 * client component, and even if it did, a client fetch is invisible to a crawler:
 * the `<title>`, canonical and JSON-LD must be in the *server* HTML.
 *
 * A route-segment layout may export `generateMetadata`, receives the same
 * `params`, and wraps the page output. So the existing page is untouched and the
 * crawler-facing layer is server-rendered. `lookupProductBySlug` falls back to
 * the bundled catalogue and separates a definitive 404 from an outage, so only a
 * genuinely absent product reaches `notFound()`.
 *
 * `force-dynamic` keeps `next build` from attempting to prerender a route that
 * has no `generateStaticParams`, and guarantees the metadata is resolved at
 * request time against the live catalogue.
 */
export const dynamic = "force-dynamic";

const BRAND_TITLE_SUFFIX = ` | ${SITE_NAME}`;

/** Roughly where Google stops displaying a title; the full text is still indexed. */
const MAX_TITLE_LENGTH = 72;

/** Where a meta description gets truncated in the snippet. */
const MAX_DESCRIPTION_LENGTH = 158;

/** Collapse storage whitespace and strip inline HTML from stored copy. */
function cleanText(value: string | undefined): string {
  return (value ?? "").replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
}

/** Cut at a word boundary so a clipped sentence does not end mid-word. */
function clip(value: string, max: number): string {
  if (value.length <= max) return value;
  const sliced = value.slice(0, Math.max(0, max - 1));
  const boundary = sliced.lastIndexOf(" ");
  return `${(boundary > max * 0.6 ? sliced.slice(0, boundary) : sliced).trimEnd()}…`;
}

/**
 * The visible price for the default variant — the same rule `page.tsx` uses.
 *
 * `sizeOptions[selectedSize]` starts at index 0 and falls back to `price`, so
 * this is the number the visitor and Google's price check both see.
 */
function displayPrice(product: Product): number {
  const firstOption = product.sizeOptions?.[0]?.price;
  if (typeof firstOption === "number" && Number.isFinite(firstOption) && firstOption > 0) {
    return firstOption;
  }

  return typeof product.price === "number" && Number.isFinite(product.price) && product.price > 0
    ? product.price
    : 0;
}

/**
 * A product title with purchase intent, built from the product's own names.
 *
 * The short name is the base (it is the human name; the catalogue title often
 * carries pack size and spec tokens), the brand is prepended only when the name
 * does not already start with it, and "Price in Bangladesh" is appended when it
 * fits. Longer names walk down this list rather than being truncated mid-word:
 * intent + brand, intent, name + brand, name.
 */
function productTitle(product: Product): { value: string; absolute: boolean } {
  const shortName = cleanText(productShortName(product));
  const brand = cleanText(product.brand);
  const base =
    brand && !shortName.toLowerCase().includes(brand.toLowerCase())
      ? `${brand} ${shortName}`
      : shortName;
  const intent = `${base} Price in Bangladesh`;

  if (`${intent}${BRAND_TITLE_SUFFIX}`.length <= MAX_TITLE_LENGTH) {
    return { value: intent, absolute: false };
  }

  if (intent.length <= MAX_TITLE_LENGTH) {
    return { value: intent, absolute: true };
  }

  if (`${base}${BRAND_TITLE_SUFFIX}`.length <= MAX_TITLE_LENGTH) {
    return { value: base, absolute: false };
  }

  return { value: base, absolute: true };
}

/**
 * A description assembled only from stored copy plus the real default price.
 * Nothing is invented: with no description the fallback states what the page
 * sells and the price, both of which are on the page itself.
 */
function productDescription(product: Product): string {
  const summary = cleanText(product.longDescription) || cleanText(product.description);
  const price = displayPrice(product);
  const priceLine = price > 0 ? `Price ${formatPrice(price)} in Bangladesh.` : "";

  if (summary) {
    const room = MAX_DESCRIPTION_LENGTH - (priceLine ? priceLine.length + 1 : 0);
    const body = clip(summary, Math.max(60, room));
    return priceLine ? `${body} ${priceLine}` : body;
  }

  return `Buy ${product.name} in Bangladesh.${priceLine ? ` ${priceLine}` : ""} Delivered nationwide by ${SITE_NAME}.`;
}

/**
 * The breadcrumb trail, mirroring the visible one on the product page.
 *
 * The brand step is compressed into the shop filter URL the storefront already
 * uses (`/shop?brand=`), so the trail also serves as the link to more from the
 * same brand. It is omitted when a product carries no brand rather than emitting
 * an empty step.
 */
function breadcrumbsForProduct(product: Product): BreadcrumbItem[] {
  const brand = cleanText(product.brand);

  return [
    { name: "Home", path: "/" },
    { name: "Shop", path: "/shop" },
    ...(brand ? [{ name: brand, path: `/shop?brand=${encodeURIComponent(brand)}` }] : []),
    { name: product.name, path: `/product/${product.slug}` },
  ];
}

interface Props {
  params: Promise<{ slug: string }>;
  children: React.ReactNode;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const slug = decodePathSegment((await params).slug);
  const lookup = await lookupProductBySlug(slug);

  if (lookup.status !== "found") {
    return buildPageMetadata({
      title: "Product not found",
      description: "We could not find that product on Mioralane.",
      path: `/product/${encodeURIComponent(slug)}`,
      noIndex: true,
    });
  }

  const { product } = lookup;
  const title = productTitle(product);

  return buildPageMetadata({
    title: title.value,
    absoluteTitle: title.absolute,
    description: productDescription(product),
    path: `/product/${product.slug}`,
    images: productImageUrls(product),
  });
}

export default async function ProductLayout({ params, children }: Props) {
  const slug = decodePathSegment((await params).slug);
  const lookup = await lookupProductBySlug(slug);

  // A deleted product must answer 404, not 200 with "not found" copy. Only the
  // API's own 404 (or a slug the offline catalogue does not know) counts;
  // an outage still renders the page, so the client can offer its retry.
  if (lookup.status === "missing") {
    notFound();
  }

  const product = lookup.status === "found" ? lookup.product : null;

  return (
    <>
      {product ? (
        <>
          <JsonLd data={generateProductJsonLd(product)} />
          <JsonLd data={generateBreadcrumbJsonLd(breadcrumbsForProduct(product))} />
        </>
      ) : null}
      {children}
    </>
  );
}
