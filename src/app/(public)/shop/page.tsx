"use client";

import { useState, useEffect, Suspense, useCallback, useMemo } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import {
  Search,
  X,
  ChevronUp,
  SlidersHorizontal,
  Filter,
} from "lucide-react";
import { ProductCard } from "@/components/product/product-card";
import { Skeleton } from "@/components/ui/skeleton";
import { useProducts } from "@/hooks/use-products";
import { CATEGORIES, SORT_OPTIONS, SKIN_TYPES } from "@/constants/site";
import type { Product } from "@/types/product";

// ─── Constants ────────────────────────────────────────────────────────────

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
  { label: "Under BDT 1,000", min: 0, max: 999 },
  { label: "BDT 1,000 - BDT 2,000", min: 1000, max: 2000 },
  { label: "BDT 2,000 - BDT 3,500", min: 2000, max: 3500 },
  { label: "BDT 3,500+", min: 3500, max: 99999 },
];

// ─── Helpers ──────────────────────────────────────────────────────────────

function paramOrNull(value: string | null): string | null {
  if (!value || value === "all" || value === "") return null;
  return value;
}

function buildApiParams(params: URLSearchParams): Record<string, string> {
  const api: Record<string, string> = {};
  const cat = paramOrNull(params.get("category"));
  const st = paramOrNull(params.get("skinType"));
  const cn = paramOrNull(params.get("concern"));
  const s = paramOrNull(params.get("search"));
  const sort = paramOrNull(params.get("sort"));
  const minP = params.get("minPrice");
  const maxP = params.get("maxPrice");
  const page = params.get("page");

  if (cat) api.category = cat;
  if (st) api.skinType = st;
  if (cn) api.skinConcern = cn;
  if (s) api.search = s;
  if (sort) api.sort = sort;
  if (minP) api.minPrice = minP;
  if (maxP) api.maxPrice = maxP;
  if (page) api.page = page;
  api.limit = "12";

  return api;
}

// ─── Shop Content Component ──────────────────────────────────────────────

function ShopContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  // ── URL-synced state ──
  const selectedCategory = paramOrNull(searchParams.get("category"));
  const selectedSkinType = searchParams.get("skinType") || "all";
  const selectedConcern = searchParams.get("concern") || "all";
  const activeSort = searchParams.get("sort") || "newest";
  const searchQuery = searchParams.get("search") || "";
  const activeMinPrice = searchParams.get("minPrice") || "";
  const activeMaxPrice = searchParams.get("maxPrice") || "";

  // ── Local UI state ──
  const [searchInput, setSearchInput] = useState(searchQuery);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [quickPrice, setQuickPrice] = useState<string | null>(null);

  // ── Sync searchInput from URL (e.g. browser back/forward) ──
  useEffect(() => {
    setSearchInput(searchQuery);
  }, [searchQuery]);

  // ── Debounced search → auto-syncs to URL → triggers API refetch ──
  useEffect(() => {
    const timer = setTimeout(() => {
      const currentSearch = searchParams.get("search") || "";
      if (searchInput !== currentSearch) {
        updateParam("search", searchInput || null);
      }
    }, 400);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchInput]);

  // ── Build API filter params ──
  const apiParams = useMemo(() => buildApiParams(searchParams), [searchParams]);

  // ── Data fetching ──
  const { data: products, isLoading } = useProducts(apiParams);

  // ── Scroll listener ──
  useEffect(() => {
    const handleScroll = () => setShowScrollTop(window.scrollY > 400);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // ── URL updater ──
  const updateParam = useCallback(
    (key: string, value: string | null) => {
      const next = new URLSearchParams(searchParams.toString());
      if (value === null || value === "all" || value === "") {
        next.delete(key);
      } else {
        next.set(key, value);
      }
      if (key !== "page") next.delete("page");
      router.push(`/shop?${next.toString()}`, { scroll: false });
    },
    [searchParams, router],
  );

  const clearAll = () => {
    setSearchInput("");
    setQuickPrice(null);
    router.push("/shop", { scroll: false });
  };

  const applyQuickPrice = (min: number, max: number) => {
    if (min === 0 && max === 99999) {
      updateParam("minPrice", null);
      updateParam("maxPrice", null);
      setQuickPrice("all");
    } else {
      updateParam("minPrice", String(min));
      updateParam("maxPrice", String(max));
      setQuickPrice(`${min}-${max}`);
    }
  };

  const hasFilters =
    !!selectedCategory ||
    selectedSkinType !== "all" ||
    selectedConcern !== "all" ||
    !!activeMinPrice ||
    !!activeMaxPrice ||
    !!searchQuery;

  const productCount = products?.length ?? 0;

  return (
    <div className="mx-auto max-w-[1400px] px-4 sm:px-6 py-6 sm:py-10">
      {/* ── Hero Banner ── */}
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

      {/* ── Search + Sort bar ── */}
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink/30" />
          <input
            type="text"
            placeholder="Search products..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                updateParam("search", searchInput || null);
              }
            }}
            className="w-full rounded-full border border-border bg-surface py-2.5 pl-10 pr-10 text-sm text-ink placeholder:text-ink/30 outline-none transition-colors focus:border-accent/40"
          />
          {searchInput && (
            <button
              onClick={() => { setSearchInput(""); updateParam("search", null); }}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-ink/30 hover:text-ink"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        <div className="flex items-center gap-3">
          <span className="text-sm font-medium text-ink/50 whitespace-nowrap">
            {productCount} product{productCount !== 1 ? "s" : ""}
          </span>
          <select
            value={activeSort}
            onChange={(e) => updateParam("sort", e.target.value)}
            className="rounded-full border border-border bg-surface px-4 py-2.5 text-sm text-ink outline-none"
          >
            {SORT_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>

          {/* Mobile filter toggle */}
          <button
            onClick={() => setMobileFiltersOpen(!mobileFiltersOpen)}
            className="inline-flex items-center gap-1.5 rounded-full border border-border bg-surface px-4 py-2.5 text-sm font-medium text-ink lg:hidden"
          >
            <SlidersHorizontal className="h-4 w-4" />
            Filters
            {hasFilters && (
              <span className="ml-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-accent text-[10px] font-bold text-white">
                !
              </span>
            )}
          </button>
        </div>
      </div>

      {/* ── Main: Sidebar + Grid ── */}
      <div className="flex gap-8">
        {/* ── Sidebar Filters ── */}
        <aside
          className={`${
            mobileFiltersOpen
              ? "fixed inset-0 z-50 flex"
              : "hidden"
          } lg:relative lg:z-auto lg:flex lg:w-[240px] lg:flex-shrink-0`}
        >
          {mobileFiltersOpen && (
            <div
              className="absolute inset-0 bg-ink/20 lg:hidden"
              onClick={() => setMobileFiltersOpen(false)}
            />
          )}
          <div
            className={`${
              mobileFiltersOpen
                ? "relative z-10 ml-auto h-full w-[280px] overflow-y-auto bg-white p-5 shadow-xl"
                : "w-full"
            } space-y-7 lg:sticky lg:top-28`}
          >
            {mobileFiltersOpen && (
              <button
                onClick={() => setMobileFiltersOpen(false)}
                className="absolute right-4 top-4 rounded-full p-1.5 text-ink/50 hover:bg-ink/[0.04] lg:hidden"
              >
                <X className="h-5 w-5" />
              </button>
            )}

            {/* Category */}
            <div>
              <h4 className="mb-3 text-xs font-bold uppercase tracking-widest text-ink/40">
                Category
              </h4>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => updateParam("category", null)}
                  className={`rounded-full px-3.5 py-1.5 text-xs font-medium transition-colors ${
                    !selectedCategory
                      ? "bg-accent text-white"
                      : "bg-ink/[0.04] text-ink/60 hover:bg-ink/[0.08]"
                  }`}
                >
                  All
                </button>
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat.slug}
                    onClick={() => updateParam("category", cat.slug)}
                    className={`rounded-full px-3.5 py-1.5 text-xs font-medium transition-colors ${
                      selectedCategory === cat.slug
                        ? "bg-accent text-white"
                        : "bg-ink/[0.04] text-ink/60 hover:bg-ink/[0.08]"
                    }`}
                  >
                    {cat.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Skin Type */}
            <div>
              <h4 className="mb-3 text-xs font-bold uppercase tracking-widest text-ink/40">
                Skin Type
              </h4>
              <div className="flex flex-col gap-1.5">
                {SKIN_TYPES.map((st) => (
                  <label
                    key={st.value}
                    className="flex cursor-pointer items-center gap-2.5 rounded-lg px-2 py-1.5 transition-colors hover:bg-ink/[0.03]"
                  >
                    <input
                      type="radio"
                      name="skinType"
                      value={st.value}
                      checked={selectedSkinType === st.value}
                      onChange={() =>
                        updateParam(
                          "skinType",
                          st.value === "all" ? null : st.value,
                        )
                      }
                      className="h-3.5 w-3.5 accent-accent"
                    />
                    <span className="text-sm text-ink/70">{st.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Concern */}
            <div>
              <h4 className="mb-3 text-xs font-bold uppercase tracking-widest text-ink/40">
                Concern
              </h4>
              <div className="flex flex-col gap-1.5">
                {CONCERNS.map((cn) => (
                  <label
                    key={cn.value}
                    className="flex cursor-pointer items-center gap-2.5 rounded-lg px-2 py-1.5 transition-colors hover:bg-ink/[0.03]"
                  >
                    <input
                      type="radio"
                      name="concern"
                      value={cn.value}
                      checked={selectedConcern === cn.value}
                      onChange={() =>
                        updateParam(
                          "concern",
                          cn.value === "all" ? null : cn.value,
                        )
                      }
                      className="h-3.5 w-3.5 accent-accent"
                    />
                    <span className="text-sm text-ink/70">{cn.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Price Range */}
            <div>
              <h4 className="mb-3 text-xs font-bold uppercase tracking-widest text-ink/40">
                Price Range
              </h4>
              <div className="flex flex-col gap-2">
                {PRICE_RANGES.map((pr, idx) => (
                  <button
                    key={idx}
                    onClick={() => applyQuickPrice(pr.min, pr.max)}
                    className={`rounded-full px-3.5 py-1.5 text-xs font-medium text-left transition-colors ${
                      (pr.min === 0 &&
                        pr.max === 99999 &&
                        !activeMinPrice &&
                        !activeMaxPrice) ||
                      `${pr.min}-${pr.max}` === quickPrice
                        ? "bg-accent text-white"
                        : "bg-ink/[0.04] text-ink/60 hover:bg-ink/[0.08]"
                    }`}
                  >
                    {pr.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Clear all */}
            {hasFilters && (
              <button
                onClick={clearAll}
                className="flex w-full items-center justify-center gap-1.5 rounded-full border border-ink/10 py-2 text-xs font-medium text-ink/50 transition-colors hover:border-ink/20 hover:text-ink"
              >
                <X className="h-3.5 w-3.5" />
                Clear all filters
              </button>
            )}
          </div>
        </aside>

        {/* ── Product Grid ── */}
        <div className="min-w-0 flex-1">
          {isLoading ? (
            <div className="grid grid-cols-2 gap-2 sm:gap-5 lg:grid-cols-3 xl:grid-cols-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="space-y-3">
                  <Skeleton className="aspect-[3/4] w-full rounded-2xl bg-ink/[0.04]" />
                  <Skeleton className="h-4 w-3/4 bg-ink/[0.04]" />
                  <Skeleton className="h-4 w-1/2 bg-ink/[0.04]" />
                </div>
              ))}
            </div>
          ) : !products || products.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-2xl border border-border-light bg-surface py-20 text-center">
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-ink/[0.04]">
                <Filter className="h-7 w-7 text-ink/20" />
              </div>
              <h2 className="text-lg font-semibold text-ink">
                No products found
              </h2>
              <p className="mt-1 mb-6 max-w-sm text-sm text-ink/50">
                Try adjusting your filters or search term to discover more
                products.
              </p>
              <button
                onClick={clearAll}
                className="rounded-full bg-accent px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-accent-dark"
              >
                Clear Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-2 sm:gap-5 lg:grid-cols-3 xl:grid-cols-4">
              {products.map((product: Product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── Back to top ── */}
      {showScrollTop && (
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          className="fixed bottom-6 right-6 z-40 flex h-11 w-11 items-center justify-center rounded-full bg-ink text-white shadow-lg transition-transform hover:scale-105"
          aria-label="Scroll to top"
        >
          <ChevronUp className="h-5 w-5" />
        </button>
      )}
    </div>
  );
}

// ─── Exported Page (with Suspense boundary) ──────────────────────────────

export default function ShopPage() {
  return (
    <Suspense
      fallback={
        <div className="mx-auto max-w-[1400px] px-4 sm:px-6 py-10">
          <div className="grid grid-cols-2 gap-2 sm:gap-5 lg:grid-cols-3 xl:grid-cols-4">
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
