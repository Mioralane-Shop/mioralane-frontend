"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ProductCard } from "@/components/product/product-card";
import { useProducts } from "@/hooks/use-products";
import { DUMMY_PRODUCTS } from "@/constants/site";
import { SectionHeading } from "@/components/common/section-heading";
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

function filterDummy(tab: TabId): Product[] {
  if (tab === "best") return DUMMY_PRODUCTS.filter((p) => p.tag === "best");
  if (tab === "new") return DUMMY_PRODUCTS.filter((p) => p.tag === "new");
  return DUMMY_PRODUCTS;
}

function getFilters(tab: TabId): Record<string, string> | undefined {
  if (tab === "best") return { tab: "bestseller", limit: "8" };
  if (tab === "new") return { tab: "new", limit: "8" };
  return { limit: "8" };
}

export function FeaturedProducts() {
  const [activeTab, setActiveTab] = useState<TabId>("all");

  const { data: products, isLoading } = useProducts(
    USE_DUMMY ? undefined : getFilters(activeTab)
  );

  const filtered = useMemo(() => {
    if (USE_DUMMY) {
      return filterDummy(activeTab as TabId).slice(0, 8);
    }
    return (products ?? []).slice(0, 8);
  }, [products, activeTab]);

  return (
    <section className="bg-surface py-12 md:py-16">
      <div className="container mx-auto px-4">
        <div className="mb-10 flex flex-col items-center gap-4 text-center">
          <SectionHeading title="FEATURED PRODUCTS" />
          <div className="mt-2 flex gap-2">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`rounded-full border px-5 py-2 text-sm font-medium transition-all ${
                  activeTab === tab.id
                    ? "border-[#2D2A26] bg-[#2D2A26] text-white shadow-[0_10px_24px_rgba(45,42,38,0.18)]"
                    : "border-neutral-200 bg-white text-[#2D2A26] shadow-sm hover:border-neutral-300 hover:bg-neutral-50"
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
            <p className="text-lg text-neutral-400">No products found</p>
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
