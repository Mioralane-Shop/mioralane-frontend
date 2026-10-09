import type { Metadata } from "next";
import { JsonLd } from "@/components/seo/json-ld";
import { getComboBySlug } from "@/lib/seo/data";
import { generateBreadcrumbJsonLd, generateProductJsonLd } from "@/lib/seo/json-ld";
import { buildPageMetadata } from "@/lib/seo/metadata";

/**
 * SEO for `/combo/[slug]`.
 *
 * Same reasoning as the product route: the page is a client component that
 * fetches with React Query, so the crawler-facing metadata and structured data
 * live in this route-segment layout instead.
 *
 * A combo is a `Product` with `itemType: "combo"`, so it reuses
 * `generateProductJsonLd` — passing `path` so the offer URL is the combo page
 * rather than a product URL that does not exist for this slug.
 */
export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ slug: string }>;
  children: React.ReactNode;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const combo = await getComboBySlug(slug);

  if (!combo) {
    return buildPageMetadata({
      title: "Bundle not found",
      description: "We could not find that routine bundle on Mioralane.",
      path: `/combo/${slug}`,
      noIndex: true,
    });
  }

  const description =
    (combo.longDescription || combo.description || "").trim().slice(0, 300) ||
    `Save on the ${combo.name} routine bundle from Mioralane.`;

  return buildPageMetadata({
    title: combo.name,
    description,
    path: `/combo/${combo.slug}`,
    images: combo.images,
  });
}

export default async function ComboLayout({ params, children }: Props) {
  const { slug } = await params;
  const combo = await getComboBySlug(slug);

  return (
    <>
      {combo ? (
        <>
          <JsonLd data={generateProductJsonLd(combo, { path: `/combo/${combo.slug}` })} />
          <JsonLd
            data={generateBreadcrumbJsonLd([
              { name: "Home", path: "/" },
              { name: "Routines & Bundles", path: "/combo" },
              { name: combo.name, path: `/combo/${combo.slug}` },
            ])}
          />
        </>
      ) : null}
      {children}
    </>
  );
}
