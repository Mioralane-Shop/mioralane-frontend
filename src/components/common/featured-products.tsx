"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ProductCard } from "@/components/product/product-card";
import { DUMMY_PRODUCTS } from "@/constants/site";
import type { Product } from "@/types/product";

const TABS = [
  { label: "All", filter: () => true },
  { label: "Best", filter: (p: Product) => p.tag === "best" },
  { label: "New", filter: (p: Product) => p.tag === "new" },
  {
    label: "Combo",
    filter: (p: Product) => p.category === "combo" || p.category === "sets",
  },
] as const;

export function FeaturedProducts() {
  const [activeTab, setActiveTab] = useState(0);

  const filtered = DUMMY_PRODUCTS.filter(TABS[activeTab].filter).slice(0, 8);

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
            {TABS.map((tab, i) => (
              <button
                key={tab.label}
                onClick={() => setActiveTab(i)}
                className={`rounded-full px-5 py-2 text-sm font-medium transition-all ${
                  activeTab === i
                    ? "bg-brand text-white shadow-md"
                    : "bg-white text-ink shadow-sm hover:shadow"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {filtered.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>

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
