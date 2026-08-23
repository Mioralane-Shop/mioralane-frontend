"use client";

import { useState } from "react";
import Link from "next/link";
import { AlertCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ProductCard } from "@/components/product/product-card";
import { useProducts } from "@/hooks/use-products";
import { SectionHeading } from "@/components/common/section-heading";

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

function getFilters(tab: TabId): Record<string, string> | undefined {
  if (tab === "best") return { tab: "bestseller", limit: "8" };
  if (tab === "new") return { tab: "new", limit: "8" };
  return { limit: "8" };
}

export function FeaturedProducts() {
  const [activeTab, setActiveTab] = useState<TabId>("all");

  const {
    data: products,
    isLoading,
    isError,
    error,
    refetch,
    isFetching,
  } = useProducts(getFilters(activeTab));

  const statusCode = (error as { response?: { status?: number } } | undefined)?.response?.status;
  const isNotFoundError = statusCode === 404;

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
        ) : isError ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-white px-6 py-20 text-center">
            <AlertCircle className="h-16 w-16 text-rose-300" />
            <h3 className="mt-4 text-lg font-semibold text-ink">
              {isNotFoundError ? "Products not found" : "Could not load products"}
            </h3>
            <p className="mt-2 max-w-sm text-sm text-ink-muted">
              {isNotFoundError
                ? "The product catalog endpoint returned a not found response."
                : "We ran into a problem fetching the product catalog. Please try again."}
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <Button onClick={() => refetch()} disabled={isFetching}>
                {isFetching ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Retrying...
                  </>
                ) : (
                  "Retry"
                )}
              </Button>
              <Button variant="outline" asChild>
                <Link href="/shop">Browse Shop</Link>
              </Button>
            </div>
          </div>
        ) : !products || products.length === 0 ? (
          <div className="py-16 text-center">
            <p className="text-lg text-neutral-400">No products found</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-2 sm:gap-4 lg:grid-cols-3 xl:grid-cols-4">
            {products.slice(0, 8).map((product) => (
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
