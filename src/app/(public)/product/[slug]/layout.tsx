import type { Metadata } from "next";
import { JsonLd } from "@/components/seo/json-ld";
import { getProductBySlug } from "@/lib/seo/data";
import { generateBreadcrumbJsonLd, generateProductJsonLd } from "@/lib/seo/json-ld";
import { buildPageMetadata } from "@/lib/seo/metadata";
import { decodePathSegment } from "@/lib/utils";

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
 * crawler-facing layer is server-rendered. `getProductBySlug` degrades to the
 * bundled catalogue when no API is configured, so it can never fail a render.
 *
 * `force-dynamic` keeps `next build` from attempting to prerender a route that
 * has no `generateStaticParams`, and guarantees the metadata is resolved at
 * request time against the live catalogue.
 */
export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ slug: string }>;
  children: React.ReactNode;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const slug = decodePathSegment((await params).slug);
  const product = await getProductBySlug(slug);

  if (!product) {
    return buildPageMetadata({
      title: "Product not found",
      description: "We could not find that product on Mioralane.",
      path: `/product/${encodeURIComponent(slug)}`,
      noIndex: true,
    });
  }

  const description =
    (product.longDescription || product.description || "").trim().slice(0, 300) ||
    `Shop ${product.name} at Mioralane — authentic Korean skincare delivered in Bangladesh.`;

  return buildPageMetadata({
    title: product.name,
    description,
    path: `/product/${product.slug}`,
    images: product.images,
  });
}

export default async function ProductLayout({ params, children }: Props) {
  const slug = decodePathSegment((await params).slug);
  const product = await getProductBySlug(slug);

  return (
    <>
      {product ? (
        <>
          <JsonLd data={generateProductJsonLd(product)} />
          <JsonLd
            data={generateBreadcrumbJsonLd([
              { name: "Home", path: "/" },
              { name: "Shop", path: "/shop" },
              { name: product.name, path: `/product/${product.slug}` },
            ])}
          />
        </>
      ) : null}
      {children}
    </>
  );
}
