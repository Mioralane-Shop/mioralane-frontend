import type { Metadata } from "next";
import { HeroSection } from "@/components/common/hero-section";
import { PromoCarousel } from "@/components/common/promo-carousel";
import { FeaturedProducts } from "@/components/common/featured-products";
import { BundlesCarousel } from "@/components/common/bundles-carousel";
import { TestimonialsSection } from "@/components/common/testimonials-section";
import { BlogPreviewSection } from "@/components/common/blog-preview-section";

export const metadata: Metadata = {
  title: "Mioralane - Premium Korean Skincare",
  description:
    "Discover our curated collection of luxury Korean skincare products for radiant, healthy skin.",
};

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <PromoCarousel />
      <FeaturedProducts />
      <BundlesCarousel />
      <TestimonialsSection />
      <BlogPreviewSection />
    </>
  );
}
