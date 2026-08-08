"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Search, X, ChevronUp } from "lucide-react";
import { ProductCard } from "@/components/product/product-card";
import { Skeleton } from "@/components/ui/skeleton";
import { useProducts } from "@/hooks/use-products";
import {
  CATEGORIES,
  SORT_OPTIONS,
  DUMMY_PRODUCTS,
  SKIN_TYPES,
} from "@/constants/site";
import type { Product } from "@/types/product";

const CONCERNS = [
  { label: "All", value: "all" },
  { label: "Hydration", value: "hydration" },
  { label: "Acne", value: "acne" },
  { label: "Brightening", value: "brightening" },
  { label: "Sensitive", value: "sensitive" },
  { label: "Anti-Aging", value: "anti-aging" },
];

const PRICE_RANGES = [
  { label: "All", min: 0, max: 99999 },
  { label: "Under ৳1,000", min: 0, max: 999 },
  { label: "৳1,000 - ৳2,000", min: 1000, max: 2000 },
  { label: "৳2,000 - ৳3,500", min: 2000, max: 3500 },
  { label: "৳3,500+", min: 3500, max: 99999 },
];

function ShopContent() {
  const searchParams = useSearchParams();
  const initialSearch = searchParams.get("search") || "";

  const [search, setSearch] = useState(initialSearch);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedSkinType, setSelectedSkinType] = useState("all");
  const [selectedConcern, setSelectedConcern] = useState("all");
  const [priceRange, setPriceRange] = useState({ min: 0, max: 99999 });
  const [sortBy, setSortBy] = useState("newest");
  const [showScrollTop, setShowScrollTop] = useState(false);

  useEffect(() => {
    const s = searchParams.get("search") || "";
    const b = searchParams.get("brand") || "";
    const cat = searchParams.get("category") || "";
    if (s) setSearch(s);
    if (b) setSearch(b);
    if (cat) setSelectedCategory(cat);
  }, [searchParams]);

  const { data: allProducts, isLoading } = useProducts();

  const products = (allProducts || DUMMY_PRODUCTS) as Product[];

  const filtered = products
    .filter((p) => {
      if (selectedCategory && p.category !== selectedCategory) return false;
      if (
        selectedSkinType !== "all" &&
        p.skinType?.toLowerCase() !== selectedSkinType
      )
        return false;
      if (
        selectedConcern !== "all" &&
        p.concerns &&
        !p.concerns.some((c) => c.toLowerCase() === selectedConcern)
      )
        return false;
      if (p.price < priceRange.min || p.price > priceRange.max) return false;
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

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 400);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const clearAllFilters = () => {
    setSelectedCategory(null);
    setSelectedSkinType("all");
    setSelectedConcern("all");
    setPriceRange({ min: 0, max: 99999 });
    setSearch("");
  };

  const hasActiveFilters =
    selectedCategory ||
    selectedSkinType !== "all" ||
    selectedConcern !== "all" ||
    priceRange.min > 0 ||
    priceRange.max < 99999;

  return (
    <div className="mx-auto max-w-[1400px] px-6 py-8">
      {/* Shop Hero Section */}
      <div className="relative mb-8 overflow-hidden rounded-3xl bg-surface py-12 md:py-16">
        <div className="absolute inset-0 bg-gradient-to-br from-surface to-surface-warm" />
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <span className="text-9xl md:text-[180px] font-serif font-light text-ink/5 uppercase tracking-widest">
            Shop
          </span>
        </div>
        <div className="relative mx-auto max-w-3xl px-4 text-center">
          <h1 className="text-3xl md:text-4xl font-serif font-medium text-ink">
            Shop All Products
          </h1>
          <p className="mt-3 text-lg text-ink/50">
            Batch-verified Korean skincare, directly sourced from Seoul.
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-6 lg:flex-row">
        {/* Sidebar Filters */}
        <aside className="w-full shrink-0 lg:w-64">
          <div className="sticky top-24 space-y-6">
            {/* Category Filter */}
            <div className="rounded-2xl border border-ink/10 bg-white p-5">
              <h3 className="mb-4 text-sm font-bold uppercase tracking-wider text-ink/40">
                Category
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
                  Clear
                </button>
              )}
            </div>

            {/* Skin Type Filter */}
            <div className="rounded-2xl border border-ink/10 bg-white p-5">
              <h3 className="mb-4 text-sm font-bold uppercase tracking-wider text-ink/40">
                Skin Type
              </h3>
              <div className="space-y-2">
                {SKIN_TYPES.map((type) => (
                  <label
                    key={type.value}
                    className="flex items-center gap-3 cursor-pointer"
                  >
                    <input
                      type="radio"
                      name="skinType"
                      value={type.value}
                      checked={selectedSkinType === type.value}
                      onChange={() => setSelectedSkinType(type.value)}
                      className="h-4 w-4 appearance-none rounded-full border border-ink/20 bg-white checked:border-brand checked:bg-brand checked:ring-2 checked:ring-brand/20 transition-colors"
                    />
                    <span className="text-sm text-ink/70">{type.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Concern Filter */}
            <div className="rounded-2xl border border-ink/10 bg-white p-5">
              <h3 className="mb-4 text-sm font-bold uppercase tracking-wider text-ink/40">
                Concern
              </h3>
              <div className="space-y-2">
                {CONCERNS.map((concern) => (
                  <label
                    key={concern.value}
                    className="flex items-center gap-3 cursor-pointer"
                  >
                    <input
                      type="radio"
                      name="concern"
                      value={concern.value}
                      checked={selectedConcern === concern.value}
                      onChange={() => setSelectedConcern(concern.value)}
                      className="h-4 w-4 appearance-none rounded-full border border-ink/20 bg-white checked:border-brand checked:bg-brand checked:ring-2 checked:ring-brand/20 transition-colors"
                    />
                    <span className="text-sm text-ink/70">{concern.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Price Range Filter */}
            <div className="rounded-2xl border border-ink/10 bg-white p-5">
              <h3 className="mb-4 text-sm font-bold uppercase tracking-wider text-ink/40">
                Price Range
              </h3>
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm text-ink/60">
                  <input
                    type="number"
                    placeholder="Min"
                    value={priceRange.min === 0 ? "" : priceRange.min}
                    onChange={(e) =>
                      setPriceRange({
                        ...priceRange,
                        min: Number(e.target.value) || 0,
                      })
                    }
                    className="min-w-0 flex-1 px-3 py-2 border border-ink/10 rounded-lg text-ink placeholder:text-ink/40 outline-none focus:border-brand"
                  />
                  <span>to</span>
                  <input
                    type="number"
                    placeholder="Max"
                    value={priceRange.max === 99999 ? "" : priceRange.max}
                    onChange={(e) =>
                      setPriceRange({
                        ...priceRange,
                        max: Number(e.target.value) || 99999,
                      })
                    }
                    className="min-w-0 flex-1 px-3 py-2 border border-ink/10 rounded-lg text-ink placeholder:text-ink/40 outline-none focus:border-brand"
                  />
                </div>
                <div className="flex flex-wrap gap-2">
                  {PRICE_RANGES.map((range) => (
                    <button
                      key={range.label}
                      onClick={() =>
                        setPriceRange({ min: range.min, max: range.max })
                      }
                      className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
                        priceRange.min === range.min &&
                        priceRange.max === range.max
                          ? "bg-ink text-white"
                          : "bg-ink/[0.04] text-ink/60 hover:bg-ink/[0.08]"
                      }`}
                    >
                      {range.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Clear All Filters */}
            {hasActiveFilters && (
              <button
                className="w-full rounded-xl border border-accent bg-accent-pale py-3 text-sm font-medium text-accent hover:bg-accent-light transition-colors"
                onClick={clearAllFilters}
              >
                Clear All Filters
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
            <div className="flex items-center gap-3">
              <span className="text-sm text-ink/50">
                {filtered.length}{" "}
                {filtered.length === 1 ? "product" : "products"} found
              </span>
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
                onClick={clearAllFilters}
              >
                Clear all filters
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Scroll to Top Button */}
      {showScrollTop && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-8 right-8 z-40 flex h-12 w-12 items-center justify-center rounded-full bg-ink text-white shadow-lg transition-all hover:scale-105 hover:shadow-xl"
          aria-label="Scroll to top"
        >
          <ChevronUp className="h-6 w-6" />
        </button>
      )}
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
