"use client";

import { useState, useEffect, Suspense, useCallback, useMemo } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import {
  Search,
  X,
  ChevronUp,
  SlidersHorizontal,
  Filter,
  Grid3X3,
  List,
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
  { label: "Under ৳1,000", min: 0, max: 999 },
  { label: "৳1,000 - ৳2,000", min: 1000, max: 2000 },
  { label: "৳2,000 - ৳3,500", min: 2000, max: 3500 },
  { label: "৳3,500+", min: 3500, max: 99999 },
];

type ViewMode = "grid" | "list";

// ─── Helpers ──────────────────────────────────────────────────────────────

function paramOrNull(value: string | null): string | null {
  const trimmed = value?.trim();
  if (!trimmed || trimmed === "all") return null;
  return trimmed;
}

function normalizeSort(value: string | null): string {
  if (!value) return "newest";
  if (value === "popularity") return "popular";
  return value;
}

function labelFromSlug(value: string): string {
  return value
    .split("-")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function buildApiParams(params: URLSearchParams): Record<string, string> {
  const api: Record<string, string> = {};
  const brand = paramOrNull(params.get("brand"));
  const cat = paramOrNull(params.get("category"));
  const st = paramOrNull(params.get("skinType"));
  const cn = paramOrNull(params.get("concern"));
  const skinConcern = paramOrNull(params.get("skinConcern"));
  const s = paramOrNull(params.get("search"));
  const sort = normalizeSort(params.get("sort"));
  const minP = params.get("minPrice");
  const maxP = params.get("maxPrice");
  const page = params.get("page");
  const featured = paramOrNull(params.get("featured"));
  const bestSeller = paramOrNull(params.get("bestSeller"));
  const inStock = paramOrNull(params.get("inStock"));

  if (brand) api.brand = brand;
  if (cat) api.category = cat;
  if (st) api.skinType = st;
  if (skinConcern) api.skinConcern = skinConcern;
  else if (cn) api.skinConcern = cn;
  if (s) api.search = s;
  if (sort) api.sort = sort;
  if (minP) api.minPrice = minP;
  if (maxP) api.maxPrice = maxP;
  if (page) api.page = page;
  if (featured) api.featured = featured;
  if (bestSeller) api.bestSeller = bestSeller;
  if (inStock) api.inStock = inStock;
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
  const activeSort = normalizeSort(searchParams.get("sort"));
  const searchQuery = paramOrNull(searchParams.get("search")) || "";
  const activeMinPrice = searchParams.get("minPrice") || "";
  const activeMaxPrice = searchParams.get("maxPrice") || "";

  // ── Local UI state ──
  const [searchInput, setSearchInput] = useState(searchQuery);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [quickPrice, setQuickPrice] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>("grid");

  // ── Sync searchInput from URL (e.g. browser back/forward) ──
  useEffect(() => {
    setSearchInput(searchQuery);
  }, [searchQuery]);

  // ── Debounced search → auto-syncs to URL → triggers API refetch ──
  useEffect(() => {
    const timer = setTimeout(() => {
      const currentSearch = searchParams.get("search") || "";
      const nextSearch = searchInput.trim();
      if (nextSearch !== currentSearch) {
        updateParam("search", nextSearch || null);
      }
    }, 400);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchInput]);

  // ── Build API filter params ──
  const apiParams = useMemo(() => buildApiParams(searchParams), [searchParams]);

  // ── Data fetching ──
  const {
    data: productsResponse,
    isLoading,
    isError,
    refetch,
  } = useProducts(apiParams);
  const products = productsResponse?.products ?? [];
  const currentPage = productsResponse?.page ?? 1;
  const totalPages = productsResponse?.totalPages ?? 1;
  const totalProducts = productsResponse?.count ?? products.length;

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

  const updateParams = useCallback(
    (updates: Record<string, string | null>) => {
      const next = new URLSearchParams(searchParams.toString());
      Object.entries(updates).forEach(([key, value]) => {
        if (value === null || value === "all" || value === "") {
          next.delete(key);
        } else {
          next.set(key, value);
        }
      });
      if (!Object.prototype.hasOwnProperty.call(updates, "page")) {
        next.delete("page");
      }

      const query = next.toString();
      router.push(query ? `/shop?${query}` : "/shop", { scroll: false });
    },
    [searchParams, router],
  );

  const setPage = useCallback(
    (page: number) => {
      const next = new URLSearchParams(searchParams.toString());
      if (page <= 1) {
        next.delete("page");
      } else {
        next.set("page", String(page));
      }

      const query = next.toString();
      router.push(query ? `/shop?${query}` : "/shop", { scroll: false });
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
      updateParams({ minPrice: null, maxPrice: null });
      setQuickPrice("all");
    } else {
      updateParams({ minPrice: String(min), maxPrice: String(max) });
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
  const activeFilters = [
    selectedCategory
      ? {
          key: "category",
          label:
            CATEGORIES.find((category) => category.slug === selectedCategory)
              ?.name ?? labelFromSlug(selectedCategory),
          onRemove: () => updateParam("category", null),
        }
      : null,
    selectedSkinType !== "all"
      ? {
          key: "skinType",
          label:
            SKIN_TYPES.find((skinType) => skinType.value === selectedSkinType)
              ?.label ?? labelFromSlug(selectedSkinType),
          onRemove: () => updateParam("skinType", null),
        }
      : null,
    selectedConcern !== "all"
      ? {
          key: "concern",
          label:
            CONCERNS.find((concern) => concern.value === selectedConcern)
              ?.label ?? labelFromSlug(selectedConcern),
          onRemove: () => updateParam("concern", null),
        }
      : null,
    activeMinPrice || activeMaxPrice
      ? {
          key: "price",
          label: `৳${activeMinPrice || "0"} - ${
            activeMaxPrice && activeMaxPrice !== "99999"
              ? `৳${activeMaxPrice}`
              : "৳5,000+"
          }`,
          onRemove: () => {
            updateParams({ minPrice: null, maxPrice: null });
            setQuickPrice(null);
          },
        }
      : null,
    searchQuery
      ? {
          key: "search",
          label: `"${searchQuery}"`,
          onRemove: () => {
            setSearchInput("");
            updateParam("search", null);
          },
        }
      : null,
  ].filter(Boolean) as { key: string; label: string; onRemove: () => void }[];
  const filterCount = activeFilters.length;

  const searchLabel = searchQuery.trim();
  const currentPageLabel = Math.max(1, currentPage);
  const selectedCategoryLabel = selectedCategory
    ? CATEGORIES.find((category) => category.slug === selectedCategory)?.name ??
      labelFromSlug(selectedCategory)
    : null;
  const pageTitle = searchLabel
    ? `Search results for "${searchLabel}"`
    : selectedCategoryLabel ?? "Shop";
  const isSearchPage = Boolean(searchLabel);

  useEffect(() => {
    if (isLoading || !productsResponse) return;

    const requestedPage = Number(searchParams.get("page") || 1);
    if (requestedPage < 1) {
      setPage(1);
      return;
    }

    if (productsResponse.totalPages > 0 && requestedPage > productsResponse.totalPages) {
      setPage(productsResponse.totalPages);
    }
  }, [isLoading, productsResponse, searchParams, setPage]);

  return (
    <main className="mx-auto max-w-[1320px] px-4 py-6 sm:px-6 sm:py-10">
      <nav aria-label="Breadcrumb" className="mb-4 text-xs text-ink-muted">
        <ol className="flex flex-wrap items-center gap-1.5">
          <li>
            <button
              type="button"
              onClick={() => router.push("/", { scroll: false })}
              className="hover:text-ink hover:underline"
            >
              Home
            </button>
          </li>
          <li aria-hidden="true">/</li>
          <li>
            <button
              type="button"
              onClick={() => router.push("/shop", { scroll: false })}
              className="hover:text-ink hover:underline"
            >
              Shop
            </button>
          </li>
          {selectedCategoryLabel ? (
            <>
              <li aria-hidden="true">/</li>
              <li className="text-ink">{selectedCategoryLabel}</li>
            </>
          ) : null}
        </ol>
      </nav>

      <section className="mb-7 flex flex-col gap-5 border-b border-border-light pb-6 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-[28px] font-medium uppercase tracking-normal text-ink">
            {pageTitle}
          </h1>
          <p className="mt-2 text-base text-ink-muted">
            {totalProducts} product{totalProducts !== 1 ? "s" : ""}
          </p>
        </div>

        <div className="relative w-full md:max-w-[360px]">
          <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink/30" />
          <input
            type="text"
            placeholder="Search products..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                updateParam("search", searchInput.trim() || null);
              }
            }}
            className="w-full rounded-full border border-border bg-white py-2.5 pl-10 pr-10 text-sm text-ink placeholder:text-ink/30 outline-none transition-colors focus:border-accent/50"
          />
          {searchInput && (
            <button
              type="button"
              onClick={() => { setSearchInput(""); updateParam("search", null); }}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-ink/30 hover:text-ink"
              aria-label="Clear search"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </section>

      {activeFilters.length > 0 ? (
        <div className="mb-5 flex flex-wrap items-center gap-2">
          {activeFilters.map((filter) => (
            <button
              key={filter.key}
              type="button"
              onClick={filter.onRemove}
              className="inline-flex items-center gap-1.5 rounded-full border border-border bg-white px-3 py-1.5 text-xs text-ink-soft transition-colors hover:border-brand-200 hover:text-ink"
            >
              {filter.label}
              <X className="h-3 w-3" />
            </button>
          ))}
          <button
            type="button"
            onClick={clearAll}
            className="text-xs font-medium text-ink-muted transition-colors hover:text-ink hover:underline"
          >
            Clear all filters
          </button>
        </div>
      ) : null}

      <div className="mb-6 flex flex-col gap-3 border-b border-border-light pb-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3 text-sm text-ink-muted">
          <span>Results: {totalProducts} products</span>
          {filterCount > 0 ? <span>Filters ({filterCount})</span> : null}
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <select
            aria-label="Sort products"
            value={activeSort}
            onChange={(e) => updateParam("sort", e.target.value)}
            className="rounded-full border border-border bg-white px-4 py-2.5 text-sm text-ink outline-none transition-colors focus:border-accent/50"
          >
            {SORT_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>

          <div className="hidden items-center rounded-full border border-border bg-white p-1 md:inline-flex">
            <button
              type="button"
              onClick={() => setViewMode("grid")}
              aria-label="Grid view"
              aria-pressed={viewMode === "grid"}
              className={`rounded-full p-2 transition-colors ${
                viewMode === "grid"
                  ? "bg-ink text-white"
                  : "text-ink-muted hover:text-ink"
              }`}
            >
              <Grid3X3 className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => setViewMode("list")}
              aria-label="List view"
              aria-pressed={viewMode === "list"}
              className={`rounded-full p-2 transition-colors ${
                viewMode === "list"
                  ? "bg-ink text-white"
                  : "text-ink-muted hover:text-ink"
              }`}
            >
              <List className="h-4 w-4" />
            </button>
          </div>

          <button
            type="button"
            onClick={() => setMobileFiltersOpen(!mobileFiltersOpen)}
            className="inline-flex items-center gap-1.5 rounded-full border border-border bg-white px-4 py-2.5 text-sm font-medium text-ink lg:hidden"
          >
            <SlidersHorizontal className="h-4 w-4" />
            Filters
            {hasFilters && (
              <span className="ml-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-accent text-[10px] font-bold text-white">
                {filterCount}
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
                ? "relative z-10 mt-auto max-h-[88vh] w-full overflow-y-auto rounded-t-2xl bg-white p-5 shadow-xl"
                : "w-full"
            } space-y-6 lg:sticky lg:top-28`}
          >
            {mobileFiltersOpen && (
              <button
                onClick={() => setMobileFiltersOpen(false)}
                className="absolute right-4 top-4 rounded-full p-1.5 text-ink/50 hover:bg-ink/[0.04] lg:hidden"
              >
                <X className="h-5 w-5" />
              </button>
            )}

            {/* Price Range */}
            <section>
              <h2 className="mb-3 text-xs font-semibold uppercase tracking-[0.16em] text-ink-muted">
                Price Range
              </h2>
              <div className="rounded-lg border border-border-light bg-white p-4">
                <div className="mb-3 flex items-center justify-between text-sm text-ink-soft">
                  <span>৳0</span>
                  <span>
                    {activeMaxPrice && activeMaxPrice !== "99999"
                      ? `৳${activeMaxPrice}`
                      : "৳5,000+"}
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="5000"
                  step="250"
                  value={
                    activeMaxPrice && activeMaxPrice !== "99999"
                      ? Number(activeMaxPrice)
                      : 5000
                  }
                  onChange={(event) => {
                    updateParams({
                      minPrice: null,
                      maxPrice:
                        event.target.value === "5000"
                          ? null
                          : event.target.value,
                    });
                    setQuickPrice(null);
                  }}
                  className="w-full accent-accent"
                  aria-label="Maximum price"
                />
                <div className="mt-4 flex flex-wrap gap-2">
                  {PRICE_RANGES.map((pr) => (
                    <button
                      key={pr.label}
                      type="button"
                      onClick={() => applyQuickPrice(pr.min, pr.max)}
                      className={`rounded-full px-3 py-1.5 text-left text-xs font-medium transition-colors ${
                        (pr.min === 0 &&
                          pr.max === 99999 &&
                          !activeMinPrice &&
                          !activeMaxPrice) ||
                        `${pr.min}-${pr.max}` === quickPrice
                          ? "bg-accent text-white"
                          : "bg-ink/[0.04] text-ink-soft hover:bg-ink/[0.08]"
                      }`}
                    >
                      {pr.label}
                    </button>
                  ))}
                </div>
              </div>
            </section>

            <details className="group border-t border-border-light pt-5" open>
              <summary className="flex cursor-pointer list-none items-center justify-between text-xs font-semibold uppercase tracking-[0.16em] text-ink-muted">
                Category
                <ChevronUp className="h-4 w-4 transition-transform group-open:rotate-180" />
              </summary>
              <div className="mt-4 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => updateParam("category", null)}
                  className={`rounded-full px-3.5 py-1.5 text-xs font-medium transition-colors ${
                    !selectedCategory
                      ? "bg-accent text-white"
                      : "bg-ink/[0.04] text-ink-soft hover:bg-ink/[0.08]"
                  }`}
                >
                  All
                </button>
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat.slug}
                    type="button"
                    onClick={() => updateParam("category", cat.slug)}
                    className={`rounded-full px-3.5 py-1.5 text-xs font-medium transition-colors ${
                      selectedCategory === cat.slug
                        ? "bg-accent text-white"
                        : "bg-ink/[0.04] text-ink-soft hover:bg-ink/[0.08]"
                    }`}
                  >
                    {cat.name}
                  </button>
                ))}
              </div>
            </details>

            <details className="group border-t border-border-light pt-5" open>
              <summary className="flex cursor-pointer list-none items-center justify-between text-xs font-semibold uppercase tracking-[0.16em] text-ink-muted">
                Skin Type
                <ChevronUp className="h-4 w-4 transition-transform group-open:rotate-180" />
              </summary>
              <div className="mt-4 flex flex-col gap-1.5">
                {SKIN_TYPES.map((st) => (
                  <label
                    key={st.value}
                    className="flex cursor-pointer items-center justify-between rounded-lg px-2 py-1.5 transition-colors hover:bg-ink/[0.03]"
                  >
                    <span className="flex items-center gap-2.5">
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
                      <span className="text-sm text-ink-soft">{st.label}</span>
                    </span>
                    <span className="text-xs text-ink-muted">({totalProducts})</span>
                  </label>
                ))}
              </div>
            </details>

            <details className="group border-t border-border-light pt-5">
              <summary className="flex cursor-pointer list-none items-center justify-between text-xs font-semibold uppercase tracking-[0.16em] text-ink-muted">
                Concern
                <ChevronUp className="h-4 w-4 transition-transform group-open:rotate-180" />
              </summary>
              <div className="mt-4 flex flex-col gap-1.5">
                {CONCERNS.map((cn) => (
                  <label
                    key={cn.value}
                    className="flex cursor-pointer items-center justify-between rounded-lg px-2 py-1.5 transition-colors hover:bg-ink/[0.03]"
                  >
                    <span className="flex items-center gap-2.5">
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
                      <span className="text-sm text-ink-soft">{cn.label}</span>
                    </span>
                    <span className="text-xs text-ink-muted">({totalProducts})</span>
                  </label>
                ))}
              </div>
            </details>

            {/* Clear all */}
            {hasFilters && (
              <button
                type="button"
                onClick={clearAll}
                className="flex w-full items-center justify-center gap-1.5 rounded-full border border-ink/10 py-2 text-xs font-medium text-ink-muted transition-colors hover:border-ink/20 hover:text-ink"
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
            <div className="grid grid-cols-2 gap-4 md:gap-6 lg:grid-cols-3">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="space-y-3">
                  <Skeleton className="aspect-[3/4] w-full rounded-2xl bg-ink/[0.04]" />
                  <Skeleton className="h-4 w-3/4 bg-ink/[0.04]" />
                  <Skeleton className="h-4 w-1/2 bg-ink/[0.04]" />
                </div>
              ))}
            </div>
          ) : isError ? (
            <div className="flex flex-col items-center justify-center border border-border-light bg-white py-20 text-center">
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-rose-50">
                <Filter className="h-7 w-7 text-rose-400" />
              </div>
              <h2 className="text-lg font-semibold text-ink">
                {isSearchPage
                  ? "Couldn\u2019t load search results."
                  : "Unable to load products"}
              </h2>
              <p className="mt-1 mb-6 max-w-sm text-sm text-ink/50">
                Please try again in a moment.
              </p>
              <button
                onClick={() => void refetch()}
                className="rounded-full bg-accent px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-accent-dark"
              >
                Retry
              </button>
            </div>
          ) : !products || products.length === 0 ? (
            <div className="flex flex-col items-center justify-center border border-border-light bg-white py-20 text-center">
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-ink/[0.04]">
                <Filter className="h-7 w-7 text-ink/20" />
              </div>
              <h2 className="text-lg font-semibold text-ink">
                {searchLabel
                  ? `No products found for "${searchLabel}"`
                  : "No products found"}
              </h2>
              <p className="mt-1 mb-6 max-w-sm text-sm text-ink/50">
                Try adjusting your filters or search term to discover more products.
              </p>
              <div className="flex flex-wrap items-center justify-center gap-3">
                {searchLabel && (
                  <button
                    type="button"
                    onClick={() => updateParam("search", null)}
                    className="rounded-full bg-accent px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-accent-dark"
                  >
                    Clear search
                  </button>
                )}
                <button
                  type="button"
                  onClick={clearAll}
                  className="rounded-full border border-ink/10 px-6 py-2.5 text-sm font-medium text-ink transition-colors hover:border-ink/20 hover:bg-white"
                >
                  Clear filters
                </button>
              </div>
            </div>
          ) : (
            <>
              <div
                className={
                  viewMode === "grid"
                    ? "grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-3"
                    : "grid grid-cols-1 gap-4"
                }
              >
                {products.map((product: Product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    layout={viewMode}
                  />
                ))}
              </div>

              <p className="mt-7 text-center text-sm text-ink-muted">
                Showing {(currentPageLabel - 1) * 12 + 1}-
                {(currentPageLabel - 1) * 12 + products.length} of{" "}
                {totalProducts} products
              </p>

              {totalPages > 1 && (
                <div className="mt-4 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
                  <button
                    type="button"
                    onClick={() => setPage(currentPageLabel - 1)}
                    disabled={currentPageLabel <= 1}
                    className="rounded-full border border-border bg-white px-5 py-2.5 text-sm font-medium text-ink transition-colors hover:border-ink/20 hover:bg-ink/[0.02] disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Previous
                  </button>
                  <span className="text-sm font-medium text-ink/50">
                    Page {currentPageLabel} of {totalPages}
                  </span>
                  <button
                    type="button"
                    onClick={() => setPage(currentPageLabel + 1)}
                    disabled={currentPageLabel >= totalPages}
                    className="rounded-full border border-border bg-white px-5 py-2.5 text-sm font-medium text-ink transition-colors hover:border-ink/20 hover:bg-ink/[0.02] disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Next
                  </button>
                </div>
              )}
            </>
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
    </main>
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
