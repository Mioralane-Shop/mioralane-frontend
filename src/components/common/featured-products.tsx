"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ProductCard } from "@/components/product/product-card";
import { useBestSellers } from "@/hooks/use-products";
import { Skeleton } from "@/components/ui/skeleton";

export function FeaturedProducts() {
  const { data: products, isLoading } = useBestSellers();

  return (
    <section className="container mx-auto px-4 py-16 md:py-20">
      <div className="mb-10 flex items-end justify-between">
        <div>
          <h2 className="text-3xl font-light tracking-tight text-neutral-800">
            Best Sellers
          </h2>
          <p className="mt-2 text-neutral-400">Our most-loved products</p>
        </div>
        <Link href="/shop?sort=best-seller">
          <Button variant="ghost" className="hidden sm:inline-flex">
            View All
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {isLoading
          ? Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="space-y-3">
                <Skeleton className="aspect-square w-full rounded-2xl" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            ))
          : products?.slice(0, 4).map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
      </div>
    </section>
  );
}
