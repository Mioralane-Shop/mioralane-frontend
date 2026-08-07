"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Search, X, ChevronRight } from "lucide-react";
import { ProductCard } from "@/components/product/product-card";
import { Skeleton } from "@/components/ui/skeleton";
import { useProducts } from "@/hooks/use-products";
import { CATEGORIES, SORT_OPTIONS, DUMMY_PRODUCTS } from "@/constants/site";
import type { Product } from "@/types/product";

function ShopContent() {
  const searchParams = useSearchParams();
  const initialSearch = searchParams.get("search") || "";

  const [search, setSearch] = useState(initialSearch);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState("newest");

  useEffect(() => {
    const s = searchParams.get("search") || "";
    const b = searchParams.get("brand") || "";
    if (s) setSearch(s);
    if (b) setSearch(b);
  }, [searchParams]);

  const { data: allProducts, isLoading } = useProducts();

  const products = (allProducts || DUMMY_PRODUCTS) as Product[];

  const filtered = products
    .filter((p) => {
      if (selectedCategory && p.category !== selectedCategory) return false;
      if (search) {
        const q = search.toLowerCase();
        const matchName = p.name.toLowerCase().includes(q);
        const matchBrand = p.brand?.toLowerCase().includes(q);
        const matchCategory = p.category?.toLowerCase().includes(q);
        if (!matchName && !matchBrand && !matchCategory) return false;
      }
      return true;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "price-asc":
          return a.price - b.price;
        case "price-desc":
          return b.price - a.price;
        case "newest":
          return (
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );
        case "rating":
          return b.rating - a.rating;
        default:
          return 0;
      }
    });

  return (
    <div className="mx-auto max-w-[1400px] px-6 py-8">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-ink/50 mb-8">
        <Link href="/" className="hover:text-ink transition-colors">Home</Link>
        <ChevronRight className="h-3 w-3" />
        <span className="text-ink">Shop</span>
      </nav>

      <div className="mb-8">
        <h1 className="text-3xl font-serif font-medium text-ink">
          Shop All
        </h1>
        <p className="mt-2 text-ink/50">
          Discover your perfect skincare routine
        </p>
      </div>

      <div className="flex flex-col gap-6 lg:flex-row">
        {/* Sidebar Filters */}
        <aside className="w-full shrink-0 lg:w-56">
          <div className="rounded-2xl border border-ink/10 bg-white p-5">
            <h3 className="mb-4 text-sm font-bold uppercase tracking-wider text-ink/40">
              Categories
            </h3>
            <div className="flex flex-wrap gap-2 lg:flex-col">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() =>
                    setSelectedCategory(
                      selectedCategory === cat.slug ? null : cat.slug,
                    )
                  }
                  className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
                    selectedCategory === cat.slug
                      ? "bg-ink text-white"
                      : "bg-ink/[0.04] text-ink/60 hover:bg-ink/[0.08]"
                  }`}
                >
                  {cat.name}
                </button>
              ))}
            </div>
            {selectedCategory && (
              <button
                className="mt-3 flex items-center gap-1 text-xs font-medium text-accent hover:underline"
                onClick={() => setSelectedCategory(null)}
              >
                <X className="h-3 w-3" />
                Clear filter
              </button>
            )}
          </div>
        </aside>

        {/* Product Grid */}
        <div className="flex-1">
          <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink/40" />
              <input
                placeholder="Search products..."
                className="w-full pl-10 pr-4 py-2.5 bg-ink/[0.04] border-none rounded-full text-sm text-ink placeholder:text-ink/40 outline-none"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-4 py-2.5 border border-ink/10 rounded-full text-sm text-ink bg-white outline-none"
            >
              {SORT_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-6 lg:grid-cols-3 xl:grid-cols-4">
            {isLoading
              ? Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="space-y-3">
                    <Skeleton className="aspect-[3/4] w-full rounded-2xl bg-ink/[0.04]" />
                    <Skeleton className="h-4 w-3/4 bg-ink/[0.04]" />
                    <Skeleton className="h-4 w-1/2 bg-ink/[0.04]" />
                  </div>
                ))
              : filtered.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
          </div>

          {!isLoading && filtered.length === 0 && (
            <div className="py-20 text-center">
              <p className="text-ink/40">
                No products found matching your criteria.
              </p>
              <button
                className="mt-3 text-sm font-medium text-accent hover:underline"
                onClick={() => {
                  setSearch("");
                  setSelectedCategory(null);
                }}
              >
                Clear all filters
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function ShopPage() {
  return (
    <Suspense
      fallback={
        <div className="mx-auto max-w-[1400px] px-6 py-8">
          <div className="grid grid-cols-2 gap-6 lg:grid-cols-3 xl:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="space-y-3">
                <Skeleton className="aspect-[3/4] w-full rounded-2xl bg-ink/[0.04]" />
                <Skeleton className="h-4 w-3/4 bg-ink/[0.04]" />
                <Skeleton className="h-4 w-1/2 bg-ink/[0.04]" />
              </div>
            ))}
          </div>
        </div>
      }
    >
      <ShopContent />
    </Suspense>
  );
}
