"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ProductCard } from "@/components/product/product-card";
import { useProducts } from "@/hooks/use-products";
import { DUMMY_PRODUCTS } from "@/constants/site";
import type { Product } from "@/types/product";

type TabId = "all" | "best" | "new";

interface Tab {
  id: TabId;
  label: string;
}

const TABS: Tab[] = [
  { id: "all", label: "All" },
  { id: "best", label: "Best" },
  { id: "new", label: "New" },
] as const;

const USE_DUMMY = !process.env.NEXT_PUBLIC_API_URL;

/** Client-side filter for dummy data (matches existing behaviour) */
function filterDummy(tab: TabId): Product[] {
  if (tab === "best") return DUMMY_PRODUCTS.filter((p) => p.tag === "best");
  if (tab === "new") return DUMMY_PRODUCTS.filter((p) => p.tag === "new");
  return DUMMY_PRODUCTS;
}

/** Server-side filter mapping for real API */
function getFilters(tab: TabId): Record<string, string> | undefined {
  if (tab === "best") return { tab: "bestseller", limit: "8" };
  if (tab === "new") return { tab: "new", limit: "8" };
  return { limit: "8" }; // "all" → fetch first 8
}

export function FeaturedProducts() {
  const [activeTab, setActiveTab] = useState<TabId>("all");

  // Real API: fetch all & filter; dummy: use local filter
  const { data: products, isLoading } = useProducts(
    USE_DUMMY ? undefined : getFilters(activeTab)
  );

  /** Compute the 8 products to display */
  const filtered = useMemo(() => {
    if (USE_DUMMY) {
      return filterDummy(activeTab as TabId).slice(0, 8);
    }
    const list = (products ?? []).slice(0, 8);
    console.log("[FeaturedProducts] activeTab:", activeTab);
    console.log("[FeaturedProducts] raw products:", products);
    console.log("[FeaturedProducts] filtered (max 8):", list);
    return list;
  }, [products, activeTab]);

  return (
    <section className="bg-surface py-12 md:py-16">
      <div className="container mx-auto px-4">
        <div className="mb-10 flex flex-col items-center gap-4 text-center">
          <h2 className="text-3xl font-light tracking-tight text-ink">
            Pick Your Skin Fix
          </h2>
          <p className="text-neutral-500">
            Curated K‑Beauty essentials — tried, tested, and loved.
          </p>
          <div className="mt-2 flex gap-2">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`rounded-full px-5 py-2 text-sm font-medium transition-all ${activeTab === tab.id
                    ? "bg-brand text-white shadow-md"
                    : "bg-white text-ink shadow-sm hover:shadow"
                  }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-2 gap-2 sm:gap-4 lg:grid-cols-3 xl:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div
                key={i}
                className="aspect-[3/4] animate-pulse rounded-2xl bg-neutral-100"
              />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-16 text-center">
            <p className="text-neutral-400 text-lg">No products found</p>
            <p className="text-neutral-300 text-sm mt-1">Check back soon for new arrivals.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-2 sm:gap-4 lg:grid-cols-3 xl:grid-cols-4">
            {filtered.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}

        <div className="mt-8 text-center">
          <Link href="/shop">
            <Button
              variant="outline"
              className="rounded-full border-brand px-8 text-brand hover:bg-brand hover:text-white"
            >
              View All Products
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
