import type { Metadata } from "next";
import { JsonLd } from "@/components/seo/json-ld";
import { generateBreadcrumbJsonLd } from "@/lib/seo/json-ld";
import { buildPageMetadata } from "@/lib/seo/metadata";

/**
 * SEO for `/shop` — the catalogue and every filtered category view.
 *
 * `shop/page.tsx` is `"use client"` (filters live in the URL), so it cannot
 * export metadata. A static route segment is enough here: no data lookup is
 * needed, just a canonical and a breadcrumb.
 *
 * Filtered views (`/shop?category=serums`) share this canonical deliberately.
 * The product pages are the indexable landing pages; the filter UI is a way to
 * browse, and letting each `?brand=`/`?sort=` permutation claim its own canonical
 * is how a catalogue generates thousands of near-duplicate URLs.
 */
export const metadata: Metadata = buildPageMetadata({
  title: "Shop Korean Skincare",
  description:
    "Browse Mioralane's full range of authentic Korean skincare — cleansers, toners, serums, moisturisers, masks and sun care from COSRX, Beauty of Joseon, ANUA, Purito, SKIN1004 and more, delivered across Bangladesh.",
  path: "/shop",
});

export default function ShopLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <JsonLd
        data={generateBreadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: "Shop", path: "/shop" },
        ])}
      />
      {children}
    </>
  );
}
