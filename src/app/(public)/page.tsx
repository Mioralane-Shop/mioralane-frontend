import type { Metadata } from "next";
import { HeroSection } from "@/components/common/hero-section";
import { PromoCarousel } from "@/components/common/promo-carousel";
import { FeaturedProducts } from "@/components/common/featured-products";
import { BundlesCarousel } from "@/components/common/bundles-carousel";
import { TestimonialsSection } from "@/components/common/testimonials-section";
import { NewsletterSection } from "@/components/common/newsletter-section";
import { NewToKBeautySection } from "@/components/common/new-to-kbeauty-section";
import { LatestSkintalks } from "@/components/common/latest-skintalks";
import { InstagramSection } from "@/components/common/instagram-section";
import { Reveal } from "@/components/common/reveal";

export const metadata: Metadata = {
  title: "Mioralane - Premium Korean Skincare",
  description:
    "Discover our curated collection of luxury Korean skincare products for radiant, healthy skin.",
};

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <Reveal>
        <PromoCarousel />
      </Reveal>
      <Reveal>
        <FeaturedProducts />
      </Reveal>
      <Reveal>
        <BundlesCarousel />
      </Reveal>
      <Reveal>
        <NewToKBeautySection />
      </Reveal>
      <Reveal>
        <TestimonialsSection />
      </Reveal>
      <Reveal>
        <LatestSkintalks />
      </Reveal>
      <Reveal>
        <InstagramSection />
      </Reveal>
      <Reveal>
        <NewsletterSection />
      </Reveal>
    </>
  );
}
