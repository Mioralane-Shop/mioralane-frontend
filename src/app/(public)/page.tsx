import type { Metadata } from "next";
import { HeroSection } from "@/components/common/hero-section";
import { PromoCarousel } from "@/components/common/promo-carousel";
import { FeaturedProducts } from "@/components/common/featured-products";
// import { BundlesCarousel } from "@/components/common/bundles-carousel";
import { NewToKBeautySection } from "@/components/common/new-to-kbeauty-section";
import { InstagramSection } from "@/components/common/instagram-section";
import { Reveal } from "@/components/common/reveal";
import { JsonLd } from "@/components/seo/json-ld";
import { generateOrganizationJsonLd, generateWebSiteJsonLd } from "@/lib/seo/json-ld";
import { buildPageMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = buildPageMetadata({
  title: "Mioralane — Premium Korean Skincare in Bangladesh",
  description:
    "Discover our curated collection of authentic Korean skincare — COSRX, Beauty of Joseon, ANUA, Purito, SKIN1004 and routine bundles — delivered across Bangladesh.",
  path: "/",
  // The title already carries the brand; the root template would repeat it.
  absoluteTitle: true,
});

export default function HomePage() {
  return (
    <>
      {/* Site-wide identity: the Organization node is the anchor (via @id) that
          every page's structured data can reference, and the WebSite node
          carries the sitelinks search box. */}
      <JsonLd data={generateOrganizationJsonLd()} />
      <JsonLd data={generateWebSiteJsonLd()} />
      <HeroSection />
      <Reveal>
        <PromoCarousel />
      </Reveal>
      <Reveal>
        <FeaturedProducts />
      </Reveal>
      {/* <Reveal>
        <BundlesCarousel />
      </Reveal> */}
      <Reveal>
        <NewToKBeautySection />
      </Reveal>
      {/* <Reveal>
        <LatestSkintalks />
      </Reveal> */}
      <Reveal>
        <InstagramSection />
      </Reveal>
      {/* <Reveal>
        <NewsletterSection />
      </Reveal> */}
    </>
  );
}
