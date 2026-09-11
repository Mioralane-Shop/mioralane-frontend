"use client";

import { useState, useEffect, Suspense, useCallback, useMemo } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import {
  ChevronDown,
  ChevronUp,
  Filter,
  Search,
  SlidersHorizontal,
  X,
} from "lucide-react";
import { ProductCard } from "@/components/product/product-card";
import { Skeleton } from "@/components/ui/skeleton";
import { useProducts } from "@/hooks/use-products";
import { CATEGORIES, SORT_OPTIONS, SKIN_TYPES } from "@/constants/site";
import { cn } from "@/lib/utils";
import type { Product } from "@/types/product";

const CATEGORY_OPTIONS = [
  { label: "Cleansers", value: "cleansers" },
  { label: "Toners", value: "toners" },
  { label: "Serums", value: "serums" },
  { label: "Moisturizers", value: "moisturizers" },
  { label: "Masks", value: "masks" },
  { label: "Sun Care", value: "sun-care" },
  { label: "Sets", value: "sets" },
];

const CONCERNS = [
  { label: "All", value: "all" },
  { label: "Hydration", value: "hydration" },
  { label: "Acne", value: "acne" },
  { label: "Brightening", value: "brightening" },
  { label: "Sensitive", value: "sensitive" },
  { label: "Anti-Aging", value: "anti-aging" },
];

const PRICE_RANGES = [
  { label: "Any price", min: null, max: null },
  { label: "Under à§³1,000", min: 0, max: 999 },
  { label: "à§³1,000 - à§³2,000", min: 1000, max: 2000 },
  { label: "à§³2,000 - à§³3,500", min: 2000, max: 3500 },
  { label: "à§³3,500+", min: 3500, max: 99999 },
] as const;

type PriceRange = (typeof PRICE_RANGES)[number];

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

function findLabel(
  options: readonly { label: string; value: string }[],
  value: string | null,
): string {
  if (!value) return "";
  return options.find((option) => option.value === value)?.label ?? value;
}

function formatParamLabel(value: string): string {
  return value
    .split("-")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function priceRangeKey(minPrice: string, maxPrice: string): string {
  return `${minPrice || "none"}-${maxPrice || "none"}`;
}

function priceRangeMatches(range: PriceRange, minPrice: string, maxPrice: string) {
  return String(range.min ?? "") === minPrice && String(range.max ?? "") === maxPrice;
}

function priceLabel(minPrice: string, maxPrice: string): string {
  const exact = PRICE_RANGES.find((range) =>
    priceRangeMatches(range, minPrice, maxPrice),
  );
  if (exact) return exact.label;
  if (minPrice && maxPrice) return `à§³${minPrice} - à§³${maxPrice}`;
  if (minPrice) return `à§³${minPrice}+`;
  if (maxPrice) return `Under à§³${maxPrice}`;
  return "";
}

type FilterPanelProps = {
  activeMaxPrice: string;
  activeMinPrice: string;
  activeFilterCount: number;
  onClearFilters: () => void;
  onConcernChange: (value: string | null) => void;
  onParamChange: (key: string, value: string | null) => void;
  onPriceChange: (range: PriceRange) => void;
  selectedCategory: string | null;
  selectedConcern: string;
  selectedSkinType: string;
  variant?: "desktop" | "mobile";
};

function FilterPanel({
  activeMaxPrice,
  activeMinPrice,
  activeFilterCount,
  onClearFilters,
  onConcernChange,
  onParamChange,
  onPriceChange,
  selectedCategory,
  selectedConcern,
  selectedSkinType,
  variant = "desktop",
}: FilterPanelProps) {
  const selectedPriceKey = priceRangeKey(activeMinPrice, activeMaxPrice);

  return (
    <div
      className={cn(
        "w-full rounded-[12px] border border-border/80 bg-surface-warm/95 p-3 shadow-[0_1px_2px_rgba(26,26,26,0.025)]",
        variant === "desktop" && "lg:sticky lg:top-28",
      )}
    >
      <div className="mb-2.5 flex items-center justify-between gap-3">
        <h2 className="text-base font-semibold text-ink">Filters</h2>
        {activeFilterCount > 0 && (
          <button
            type="button"
            onClick={onClearFilters}
            className="text-xs font-semibold text-accent transition-colors hover:text-accent-dark"
          >
            Clear all
          </button>
        )}
      </div>

      <div className="space-y-2">
        <FilterSection
          title="Category"
          defaultOpen
          hasActive={Boolean(selectedCategory)}
        >
          <SelectionRow
            label="All"
            selected={!selectedCategory}
            onSelect={() => onParamChange("category", null)}
          />
          {CATEGORY_OPTIONS.map((category) => (
            <SelectionRow
              key={category.value}
              label={category.label}
              selected={selectedCategory === category.value}
              onSelect={() => onParamChange("category", category.value)}
            />
          ))}
        </FilterSection>

        <FilterSection
          title="Skin Type"
          defaultOpen={selectedSkinType !== "all"}
          hasActive={selectedSkinType !== "all"}
        >
          {SKIN_TYPES.map((skinType) => (
            <SelectionRow
              key={skinType.value}
              label={skinType.label}
              selected={selectedSkinType === skinType.value}
              onSelect={() =>
                onParamChange(
                  "skinType",
                  skinType.value === "all" ? null : skinType.value,
                )
              }
            />
          ))}
        </FilterSection>

        <FilterSection
          title="Concern"
          defaultOpen={selectedConcern !== "all"}
          hasActive={selectedConcern !== "all"}
        >
          {CONCERNS.map((concern) => (
            <SelectionRow
              key={concern.value}
              label={concern.label}
              selected={selectedConcern === concern.value}
              onSelect={() =>
                onConcernChange(concern.value === "all" ? null : concern.value)
              }
            />
          ))}
        </FilterSection>

        <FilterSection
          title="Price Range"
          defaultOpen={Boolean(activeMinPrice || activeMaxPrice)}
          hasActive={Boolean(activeMinPrice || activeMaxPrice)}
        >
          {PRICE_RANGES.map((range) => {
            const isSelected =
              range.min === null && range.max === null
                ? !activeMinPrice && !activeMaxPrice
                : selectedPriceKey ===
                  priceRangeKey(String(range.min ?? ""), String(range.max ?? ""));

            return (
              <SelectionRow
                key={range.label}
                label={range.label}
                selected={isSelected}
                onSelect={() => onPriceChange(range)}
              />
            );
          })}
        </FilterSection>
      </div>
    </div>
  );
}

type FilterSectionProps = {
  children: React.ReactNode;
  defaultOpen?: boolean;
  hasActive?: boolean;
  title: string;
};

function FilterSection({
  children,
  defaultOpen = false,
  hasActive = false,
  title,
}: FilterSectionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen || hasActive);

  useEffect(() => {
    if (hasActive) setIsOpen(true);
  }, [hasActive]);

  return (
    <section className="space-y-1.5">
      <button
        type="button"
        aria-expanded={isOpen}
        onClick={() => setIsOpen((open) => !open)}
        className="flex min-h-8 w-full items-center justify-between gap-3 rounded-[10px] bg-white/55 px-2.5 py-1.5 text-left transition-colors hover:bg-white/75"
      >
        <span className="text-[13px] font-semibold text-ink/80">
          {title}
        </span>
        <ChevronDown
          className={cn(
            "h-4 w-4 text-ink/40 transition-transform",
            isOpen && "rotate-180 text-accent",
          )}
        />
      </button>

      {isOpen && <div className="space-y-1.5 px-1 pb-0.5 pt-1">{children}</div>}
    </section>
  );
}

type SelectionRowProps = {
  label: string;
  onSelect: () => void;
  selected: boolean;
};

function SelectionRow({ label, onSelect, selected }: SelectionRowProps) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={selected}
      onClick={onSelect}
      className={cn(
        "flex min-h-6 w-full items-center gap-2.5 rounded-md px-1 text-left text-[13px] leading-none transition-colors",
        selected ? "text-ink" : "text-ink/65 hover:text-ink/85",
      )}
    >
      <span
        className={cn(
          "flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded-full border transition-colors",
          selected ? "border-accent" : "border-ink/30",
        )}
      >
        {selected && <span className="h-1.5 w-1.5 rounded-full bg-accent" />}
      </span>
      <span>{label}</span>
    </button>
  );
}

type SortControlProps = {
  activeSort: string;
  compact?: boolean;
  onChange: (value: string) => void;
};

function SortControl({ activeSort, compact = false, onChange }: SortControlProps) {
  return (
    <label
      className={cn(
        "flex items-center gap-2 text-sm text-ink/60",
        compact && "w-full justify-end",
      )}
    >
      <span className={cn("whitespace-nowrap", compact && "sr-only")}>Sort by</span>
      <span className={cn("relative", compact && "min-w-[128px]")}>
        <select
          value={activeSort}
          onChange={(event) => onChange(event.target.value)}
          className={cn(
            "h-11 appearance-none rounded-full border border-border bg-white pl-4 pr-10 text-sm font-medium text-ink shadow-sm outline-none transition-colors focus:border-accent/40",
            compact ? "w-full" : "min-w-[150px]",
          )}
        >
          {SORT_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink/40" />
      </span>
    </label>
  );
}

function ShopContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const selectedCategory = paramOrNull(searchParams.get("category"));
  const selectedSkinType = searchParams.get("skinType") || "all";
  const selectedConcern =
    paramOrNull(searchParams.get("skinConcern")) ||
    paramOrNull(searchParams.get("concern")) ||
    "all";
  const activeSort = normalizeSort(searchParams.get("sort"));
  const searchQuery = paramOrNull(searchParams.get("search")) || "";
  const activeMinPrice = searchParams.get("minPrice") || "";
  const activeMaxPrice = searchParams.get("maxPrice") || "";

  const [searchInput, setSearchInput] = useState(searchQuery);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);

  const pushParams = useCallback(
    (mutate: (next: URLSearchParams) => void, resetPage = true) => {
      const next = new URLSearchParams(searchParams.toString());
      mutate(next);
      if (resetPage) next.delete("page");

      const query = next.toString();
      router.push(query ? `/shop?${query}` : "/shop", { scroll: false });
    },
    [searchParams, router],
  );

  const updateParam = useCallback(
    (key: string, value: string | null) => {
      pushParams(
        (next) => {
          if (value === null || value === "all" || value === "") {
            next.delete(key);
          } else {
            next.set(key, value);
          }
        },
        key !== "page",
      );
    },
    [pushParams],
  );

  const updateConcern = useCallback(
    (value: string | null) => {
      pushParams((next) => {
        next.delete("concern");
        next.delete("skinConcern");
        if (value) next.set("concern", value);
      });
    },
    [pushParams],
  );

  const setPage = useCallback(
    (page: number) => {
      pushParams(
        (next) => {
          if (page <= 1) {
            next.delete("page");
          } else {
            next.set("page", String(page));
          }
        },
        false,
      );
    },
    [pushParams],
  );

  const clearFilters = useCallback(() => {
    pushParams((next) => {
      [
        "brand",
        "category",
        "skinType",
        "concern",
        "skinConcern",
        "minPrice",
        "maxPrice",
        "featured",
        "bestSeller",
        "inStock",
      ].forEach((key) => next.delete(key));
    });
  }, [pushParams]);

  const applyPriceRange = useCallback(
    (range: PriceRange) => {
      pushParams((next) => {
        if (range.min === null && range.max === null) {
          next.delete("minPrice");
          next.delete("maxPrice");
          return;
        }

        next.set("minPrice", String(range.min));
        next.set("maxPrice", String(range.max));
      });
    },
    [pushParams],
  );

  useEffect(() => {
    setSearchInput(searchQuery);
  }, [searchQuery]);

  useEffect(() => {
    const timer = setTimeout(() => {
      const nextSearch = searchInput.trim();
      if (nextSearch !== searchQuery) {
        updateParam("search", nextSearch || null);
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [searchInput, searchQuery, updateParam]);

  const apiParams = useMemo(() => buildApiParams(searchParams), [searchParams]);

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

  useEffect(() => {
    const handleScroll = () => setShowScrollTop(window.scrollY > 400);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (isLoading || !productsResponse) return;

    const requestedPage = Number(searchParams.get("page") || 1);
    if (requestedPage < 1) {
      setPage(1);
      return;
    }

    if (
      productsResponse.totalPages > 0 &&
      requestedPage > productsResponse.totalPages
    ) {
      setPage(productsResponse.totalPages);
    }
  }, [isLoading, productsResponse, searchParams, setPage]);

  const activeFilterChips = useMemo(() => {
    const chips: { id: string; label: string; remove: () => void }[] = [];

    const brand = paramOrNull(searchParams.get("brand"));
    const featured = paramOrNull(searchParams.get("featured"));
    const bestSeller = paramOrNull(searchParams.get("bestSeller"));
    const inStock = paramOrNull(searchParams.get("inStock"));

    if (brand) {
      chips.push({
        id: "brand",
        label: formatParamLabel(brand),
        remove: () => updateParam("brand", null),
      });
    }

    if (selectedCategory) {
      chips.push({
        id: "category",
        label:
          CATEGORY_OPTIONS.find((category) => category.value === selectedCategory)
            ?.label ??
          CATEGORIES.find((category) => category.slug === selectedCategory)?.name ??
          formatParamLabel(selectedCategory),
        remove: () => updateParam("category", null),
      });
    }

    if (selectedSkinType !== "all") {
      chips.push({
        id: "skinType",
        label: findLabel(SKIN_TYPES, selectedSkinType),
        remove: () => updateParam("skinType", null),
      });
    }

    if (selectedConcern !== "all") {
      chips.push({
        id: "concern",
        label: findLabel(CONCERNS, selectedConcern),
        remove: () => updateConcern(null),
      });
    }

    if (activeMinPrice || activeMaxPrice) {
      chips.push({
        id: "price",
        label: priceLabel(activeMinPrice, activeMaxPrice),
        remove: () =>
          pushParams((next) => {
            next.delete("minPrice");
            next.delete("maxPrice");
          }),
      });
    }

    if (featured) {
      chips.push({
        id: "featured",
        label: "Featured",
        remove: () => updateParam("featured", null),
      });
    }

    if (bestSeller) {
      chips.push({
        id: "bestSeller",
        label: "Best Seller",
        remove: () => updateParam("bestSeller", null),
      });
    }

    if (inStock) {
      chips.push({
        id: "inStock",
        label: "In Stock",
        remove: () => updateParam("inStock", null),
      });
    }

    return chips;
  }, [
    activeMaxPrice,
    activeMinPrice,
    searchParams,
    selectedCategory,
    selectedConcern,
    selectedSkinType,
    pushParams,
    updateConcern,
    updateParam,
  ]);

  const activeFilterCount = activeFilterChips.length;
  const hasSearchOrFilters = activeFilterCount > 0 || Boolean(searchQuery);
  const currentPageLabel = Math.max(1, currentPage);
  const searchLabel = searchQuery.trim();
  const pageTitle = searchLabel
    ? `Search results for "${searchLabel}"`
    : "Shop All Products";
  const isSearchPage = Boolean(searchLabel);

  const filterPanelProps: FilterPanelProps = {
    activeFilterCount,
    activeMaxPrice,
    activeMinPrice,
    onClearFilters: clearFilters,
    onConcernChange: updateConcern,
    onParamChange: updateParam,
    onPriceChange: applyPriceRange,
    selectedCategory,
    selectedConcern,
    selectedSkinType,
  };

  return (
    <div className="mx-auto max-w-[1400px] px-4 py-6 sm:px-6 sm:py-10">
      <div className="relative mb-8 overflow-hidden rounded-3xl bg-surface py-12 md:py-16">
        <div className="absolute inset-0 bg-gradient-to-br from-surface to-surface-warm" />
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <span className="font-serif text-9xl font-light uppercase tracking-widest text-ink/5 md:text-[180px]">
            Shop
          </span>
        </div>
        <div className="relative mx-auto max-w-3xl px-4 text-center">
          <h1 className="font-serif text-3xl font-medium text-ink md:text-4xl">
            {pageTitle}
          </h1>
          {searchLabel ? (
            <p className="mt-3 text-lg text-ink/50">
              Refine the search or clear it to browse everything.
            </p>
          ) : (
            <p className="mt-3 text-lg text-ink/50">
              Batch-verified Korean skincare, directly sourced from Seoul.
            </p>
          )}
        </div>
      </div>

      <div className="mb-6 space-y-4 lg:ml-[272px]">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-ink/35" />
          <input
            type="search"
            placeholder="Search products..."
            value={searchInput}
            onChange={(event) => setSearchInput(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                updateParam("search", searchInput.trim() || null);
              }
            }}
            className="h-12 w-full rounded-full border border-border bg-white pl-12 pr-11 text-sm text-ink shadow-sm outline-none transition-colors placeholder:text-ink/35 focus:border-accent/40"
          />
          {searchInput && (
            <button
              type="button"
              onClick={() => {
                setSearchInput("");
                updateParam("search", null);
              }}
              className="absolute right-3.5 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full text-ink/40 transition-colors hover:bg-ink/[0.04] hover:text-ink"
              aria-label="Clear search"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        <div className="hidden items-start justify-between gap-4 lg:flex">
          <div className="min-w-0 flex flex-wrap items-center gap-2">
            <span className="mr-3 whitespace-nowrap text-lg font-medium text-ink">
              {totalProducts} product{totalProducts !== 1 ? "s" : ""}
            </span>
            {activeFilterChips.map((chip) => (
              <button
                key={chip.id}
                type="button"
                onClick={chip.remove}
                className="inline-flex h-9 items-center gap-2 rounded-full bg-accent-pale px-4 text-sm font-medium text-ink transition-colors hover:bg-accent-light/45"
              >
                {chip.label}
                <X className="h-3.5 w-3.5 text-ink/50" />
              </button>
            ))}
            {activeFilterCount > 0 && (
              <button
                type="button"
                onClick={clearFilters}
                className="ml-1 h-9 text-sm font-semibold text-accent transition-colors hover:text-accent-dark"
              >
                Clear all
              </button>
            )}
          </div>
          <SortControl activeSort={activeSort} onChange={(value) => updateParam("sort", value)} />
        </div>

        <div className="flex items-center justify-between gap-3 lg:hidden">
          <button
            type="button"
            onClick={() => setMobileFiltersOpen(true)}
            className="inline-flex h-11 min-w-[132px] items-center justify-center gap-2 rounded-full border border-border bg-white px-4 text-sm font-medium text-ink shadow-sm"
          >
            <SlidersHorizontal className="h-4 w-4" />
            Filters ({activeFilterCount})
          </button>
          <SortControl
            activeSort={activeSort}
            compact
            onChange={(value) => updateParam("sort", value)}
          />
        </div>

        {activeFilterCount > 0 && (
          <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 lg:hidden">
            {activeFilterChips.map((chip) => (
              <button
                key={chip.id}
                type="button"
                onClick={chip.remove}
                className="inline-flex h-9 shrink-0 items-center gap-2 rounded-full bg-accent-pale px-4 text-sm font-medium text-ink"
              >
                {chip.label}
                <X className="h-3.5 w-3.5 text-ink/50" />
              </button>
            ))}
            <button
              type="button"
              onClick={clearFilters}
              className="h-9 shrink-0 px-1 text-sm font-semibold text-accent"
            >
              Clear all
            </button>
          </div>
        )}
      </div>

      <div className="flex gap-8">
        <aside className="hidden w-[240px] shrink-0 lg:block">
          <FilterPanel {...filterPanelProps} />
        </aside>

        <div className="min-w-0 flex-1">
          {isLoading ? (
            <div className="grid grid-cols-2 gap-2 sm:gap-5 lg:grid-cols-3 xl:grid-cols-4">
              {Array.from({ length: 8 }).map((_, index) => (
                <div key={index} className="space-y-3">
                  <Skeleton className="aspect-[3/4] w-full rounded-2xl bg-ink/[0.04]" />
                  <Skeleton className="h-4 w-3/4 bg-ink/[0.04]" />
                  <Skeleton className="h-4 w-1/2 bg-ink/[0.04]" />
                </div>
              ))}
            </div>
          ) : isError ? (
            <div className="flex flex-col items-center justify-center rounded-2xl border border-border-light bg-surface py-20 text-center">
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-brand-50">
                <Filter className="h-7 w-7 text-brand-400" />
              </div>
              <h2 className="text-lg font-semibold text-ink">
                {isSearchPage
                  ? "Couldn't load search results"
                  : "Unable to load products"}
              </h2>
              <p className="mb-6 mt-1 max-w-sm text-sm text-ink/50">
                Please try again in a moment.
              </p>
              <button
                type="button"
                onClick={() => void refetch()}
                className="rounded-full bg-accent px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-accent-dark"
              >
                Retry
              </button>
            </div>
          ) : !products || products.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-2xl border border-border-light bg-surface py-20 text-center">
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-ink/[0.04]">
                <Filter className="h-7 w-7 text-ink/20" />
              </div>
              <h2 className="text-lg font-semibold text-ink">No products found</h2>
              <p className="mb-6 mt-1 max-w-sm text-sm text-ink/50">
                {activeFilterCount > 0
                  ? "We don't currently have products matching these filters."
                  : searchLabel
                    ? `We don't currently have products matching "${searchLabel}".`
                    : "We don't currently have products available here."}
              </p>
              {hasSearchOrFilters && (
                <div className="flex flex-wrap items-center justify-center gap-3">
                  {activeFilterCount > 0 && (
                    <button
                      type="button"
                      onClick={clearFilters}
                      className="rounded-full bg-accent px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-accent-dark"
                    >
                      Clear filters
                    </button>
                  )}
                  {searchLabel && (
                    <button
                      type="button"
                      onClick={() => {
                        setSearchInput("");
                        updateParam("search", null);
                      }}
                      className="rounded-full border border-ink/10 px-6 py-2.5 text-sm font-medium text-ink transition-colors hover:border-ink/20 hover:bg-white"
                    >
                      Clear search
                    </button>
                  )}
                </div>
              )}
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 gap-2 sm:gap-5 lg:grid-cols-3 xl:grid-cols-4">
                {products.map((product: Product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>

              {totalPages > 1 && (
                <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
                  <button
                    type="button"
                    onClick={() => setPage(currentPageLabel - 1)}
                    disabled={currentPageLabel <= 1}
                    className="rounded-full border border-border bg-surface px-5 py-2.5 text-sm font-medium text-ink transition-colors hover:border-ink/20 hover:bg-white disabled:cursor-not-allowed disabled:opacity-50"
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
                    className="rounded-full border border-border bg-surface px-5 py-2.5 text-sm font-medium text-ink transition-colors hover:border-ink/20 hover:bg-white disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Next
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {mobileFiltersOpen && (
        <div className="fixed inset-0 z-50 lg:hidden" role="dialog" aria-modal="true">
          <div
            className="absolute inset-0 bg-ink/30"
            onClick={() => setMobileFiltersOpen(false)}
          />
          <div className="absolute inset-y-0 left-0 flex w-[min(92vw,360px)] flex-col bg-surface px-5 pt-5 shadow-lg">
            <button
              type="button"
              onClick={() => setMobileFiltersOpen(false)}
              className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full text-ink/50 transition-colors hover:bg-ink/[0.04] hover:text-ink"
              aria-label="Close filters"
            >
              <X className="h-5 w-5" />
            </button>
            <div className="min-h-0 flex-1 overflow-y-auto pb-5 pr-1">
              <FilterPanel {...filterPanelProps} variant="mobile" />
            </div>
            <div className="sticky bottom-0 -mx-5 border-t border-border-light bg-surface px-5 py-4">
              <button
                type="button"
                onClick={() => setMobileFiltersOpen(false)}
                className="flex h-11 w-full items-center justify-center rounded-full bg-accent px-5 text-sm font-semibold text-white transition-colors hover:bg-accent-dark"
              >
                Show {totalProducts} Product{totalProducts !== 1 ? "s" : ""}
              </button>
            </div>
          </div>
        </div>
      )}

      {showScrollTop && (
        <button
          type="button"
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

export default function ShopPage() {
  return (
    <Suspense
      fallback={
        <div className="mx-auto max-w-[1400px] px-4 py-10 sm:px-6">
          <div className="grid grid-cols-2 gap-2 sm:gap-5 lg:grid-cols-3 xl:grid-cols-4">
            {Array.from({ length: 8 }).map((_, index) => (
              <div key={index} className="space-y-3">
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
