import type { Metadata } from "next";
import { HeroSection } from "@/components/common/hero-section";
import { CategorySection } from "@/components/common/category-section";
import { FeaturedProducts } from "@/components/common/featured-products";
import { NewsletterSection } from "@/components/common/newsletter-section";

export const metadata: Metadata = {
  title: "Mioralane - Premium Korean Skincare",
  description:
    "Discover our curated collection of luxury Korean skincare products for radiant, healthy skin.",
};

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <CategorySection />
      <FeaturedProducts />
      <NewsletterSection />
    </>
  );
}
