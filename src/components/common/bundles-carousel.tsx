"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  AlertCircle,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Heart,
  Layers3,
  Leaf,
  Loader2,
  Package,
  Plane,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ProductImage } from "@/components/common/product-image";
import { useCombos } from "@/hooks/use-combos";
import { cn, formatPrice } from "@/lib/utils";
import { useAuthStore } from "@/store/auth.store";
import { useCartStore } from "@/store/cart.store";
import { useToastStore } from "@/store/toast.store";
import { useWishlistStore } from "@/store/wishlist.store";
import type { ComboProduct } from "@/services/combo.service";

const CARD_TREATMENTS = [
  {
    background: "bg-[#FBF2F1]",
    wash: "from-[#FBF2F1] via-[#FBF2F1]/95 to-[#FBF2F1]/15",
    badge: "bg-[#D4637A] text-white",
    savings: "bg-[#F4D8DD] text-[#B84E64]",
  },
  {
    background: "bg-[#F7F0E8]",
    wash: "from-[#F7F0E8] via-[#F7F0E8]/95 to-[#F7F0E8]/20",
    badge: "bg-[#A88D70] text-white",
    savings: "bg-[#EBDAC8] text-[#8A6A4B]",
  },
  {
    background: "bg-[#F5F0EC]",
    wash: "from-[#F5F0EC] via-[#F5F0EC]/95 to-[#F5F0EC]/20",
    badge: "bg-[#8B7355] text-white",
    savings: "bg-white/70 text-[#7D6651]",
  },
  {
    background: "bg-[#F8F6F1]",
    wash: "from-[#F8F6F1] via-[#F8F6F1]/95 to-[#F8F6F1]/20",
    badge: "bg-[#A68B6B] text-white",
    savings: "bg-[#EEE7DA] text-[#79664B]",
  },
] as const;

const TEMP_COMBO_IMAGE = "/temp-combo/skin-1004.png";

function getSavings(combo: ComboProduct) {
  const compareAtPrice = combo.compareAtPrice ?? 0;
  return combo.savings && combo.savings > 0
    ? combo.savings
    : compareAtPrice > combo.price
      ? compareAtPrice - combo.price
      : 0;
}

function getDiscountPercent(combo: ComboProduct, savings: number) {
  const compareAtPrice = combo.compareAtPrice ?? 0;

  if (compareAtPrice > combo.price) {
    return Math.round((savings / compareAtPrice) * 100);
  }

  if (savings > 0) {
    return Math.round((savings / (combo.price + savings)) * 100);
  }

  return 0;
}

function getCompareAtPrice(combo: ComboProduct) {
  const compareAtPrice = combo.compareAtPrice ?? 0;

  if (compareAtPrice > combo.price) {
    return compareAtPrice;
  }

  return undefined;
}

function getComboName(combo: ComboProduct) {
  return combo.name || (combo as ComboProduct & { title?: string }).title || "Bundle";
}

function getHeroTitleLayout(combo: ComboProduct) {
  const comboName = getComboName(combo).trim();
  const normalizedName = comboName.toLowerCase();
  const sourceText = [
    combo.brand,
    combo.name,
    combo.badge,
    combo.description,
    combo.routineTag,
    combo.skinType,
    ...(combo.tags ?? []),
    ...(combo.concerns ?? []),
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  if (sourceText.match(/skin\s*1004|centella/) && comboName.endsWith("Travel Kit")) {
    const prefixedName = normalizedName.startsWith("skin1004")
      ? comboName
      : `SKIN1004 - ${comboName}`;

    return {
      mobile: prefixedName,
      desktopFirstLine: prefixedName.replace(/\s+Travel Kit$/, ""),
      desktopSecondLine: "Travel Kit",
    };
  }

  return {
    mobile: comboName,
    desktopFirstLine: comboName,
    desktopSecondLine: "",
  };
}

function getComboImage(combo: ComboProduct) {
  const sourceText = [
    combo.brand,
    combo.name,
    combo.badge,
    combo.description,
    combo.routineTag,
    combo.skinType,
    ...(combo.tags ?? []),
    ...(combo.concerns ?? []),
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  if (sourceText.match(/skin\s*1004|centella|travel|on-the-go|mini/)) {
    return TEMP_COMBO_IMAGE;
  }

  return combo.images?.[0] ?? "";
}

function getShortDescription(combo: ComboProduct) {
  const description = combo.description?.trim();

  if (!description) return "";

  const withoutSavings = description.split(/\s+save\s+/i)[0]?.trim() || description;
  return withoutSavings.length > 78
    ? `${withoutSavings.slice(0, 75).trim()}...`
    : withoutSavings;
}

function formatAttributeLabel(value: string) {
  return value
    .replace(/^for\s+/i, "")
    .replace(/-/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function getAttributeRows(combo: ComboProduct) {
  const rows: Array<{
    icon: typeof Layers3;
    label: string;
  }> = [];
  const includedCount = combo.includedItems?.filter(Boolean).length ?? 0;
  const sizeCount = (combo.size ?? combo.volume ?? "").match(/\d+/)?.[0];
  const productCount = includedCount || (sizeCount ? Number(sizeCount) : 0);
  const sourceText = [
    combo.name,
    combo.badge,
    combo.description,
    combo.routineTag,
    combo.skinType,
    ...(combo.tags ?? []),
    ...(combo.concerns ?? []),
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  if (productCount > 0) {
    rows.push({
      icon: Layers3,
      label: `${productCount} Product${productCount === 1 ? "" : "s"}`,
    });
  }

  if (sourceText.match(/travel|on-the-go|mini|trial|try-before-buy/)) {
    rows.push({ icon: Plane, label: "Travel Friendly" });
  }

  const skinType = combo.skinType ? formatAttributeLabel(combo.skinType) : "";
  const routineTag = combo.routineTag ? formatAttributeLabel(combo.routineTag) : "";
  const firstConcern = combo.concerns?.[0] ? formatAttributeLabel(combo.concerns[0]) : "";
  const careLabel = skinType || routineTag || firstConcern;

  if (careLabel) {
    rows.push({ icon: Leaf, label: careLabel });
  }

  return rows.slice(0, 3);
}

function BundleCard({
  combo,
  index,
  onAddToCart,
  onOpen,
  onWishlist,
  isWishlisted,
  isTogglingWishlist,
}: {
  combo: ComboProduct;
  index: number;
  onAddToCart: (combo: ComboProduct) => void;
  onOpen: (combo: ComboProduct) => void;
  onWishlist: (combo: ComboProduct) => void;
  isWishlisted: boolean;
  isTogglingWishlist: boolean;
}) {
  const treatment = CARD_TREATMENTS[index % CARD_TREATMENTS.length];
  const comboName = getComboName(combo);
  const heroTitle = getHeroTitleLayout(combo);
  const image = getComboImage(combo);
  const savings = getSavings(combo);
  const compareAtPrice = getCompareAtPrice(combo);
  const discountPercent = getDiscountPercent(combo, savings);
  const label = (combo.brand || combo.badge || "Bundle").toUpperCase();
  const description = getShortDescription(combo);
  const attributes = getAttributeRows(combo);

  return (
    <article
      role="link"
      tabIndex={0}
      onClick={() => onOpen(combo)}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          onOpen(combo);
        }
      }}
      className={cn(
        "group flex h-full min-w-full snap-start cursor-pointer flex-col overflow-hidden rounded-[1.75rem] border border-border/80 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-accent/20 hover:shadow",
        "lg:min-w-[calc((100%-1.5rem)/2)]",
        treatment.background
      )}
    >
      <div className="relative min-h-[336px] overflow-hidden sm:min-h-[368px] lg:min-h-[316px]">
        {image ? (
          <ProductImage
            src={image}
            alt={comboName}
            fill
            sizes="(max-width: 1024px) 100vw, 48vw"
            className="object-cover object-center transition-transform duration-500 ease-out group-hover:scale-[1.015]"
            fallbackId={combo.id}
          />
        ) : null}

        <div
          className={cn(
            "absolute inset-0 bg-gradient-to-b via-[55%] to-transparent lg:bg-gradient-to-r",
            treatment.wash
          )}
        />

        <button
          onClick={(event) => {
            event.stopPropagation();
            onWishlist(combo);
          }}
          disabled={isTogglingWishlist}
          className={cn(
            "absolute right-4 top-4 z-20 flex h-10 w-10 items-center justify-center rounded-full bg-white/95 text-ink shadow-sm ring-1 ring-ink/5 transition-all hover:scale-105 hover:text-accent disabled:cursor-wait disabled:opacity-70",
            isWishlisted && "text-accent"
          )}
          title={isWishlisted ? "Remove from Wishlist" : "Add to Wishlist"}
          aria-label={isWishlisted ? "Remove from Wishlist" : "Add to Wishlist"}
        >
          <Heart className={cn("h-5 w-5", isWishlisted && "fill-current")} />
        </button>
        {/* 
        {discountPercent > 0 ? (
          <div
            className="discount-running-border absolute right-4 top-[4.8rem] z-20 flex h-16 w-16 flex-col items-center justify-center rounded-full border text-center text-[#79664B] shadow-[0_14px_28px_rgba(143,100,32,0.18)] sm:h-20 sm:w-20"
          >
            <span className="text-[9px] font-bold uppercase leading-none tracking-[0.14em]">
              Save
            </span>
            <span className="mt-1 text-xl font-bold leading-none sm:text-2xl">
              {discountPercent}%
            </span>
          </div>
        ) : null} */}

        <div className="relative z-10 flex min-h-[336px] max-w-[20rem] flex-col justify-center p-4 pr-24 sm:min-h-[368px] sm:max-w-[21rem] sm:p-5.5 sm:pr-28 lg:min-h-[316px] lg:w-[42%] lg:max-w-[22rem] lg:pr-3">
          <div>
            <span className="inline-flex max-w-full rounded-full bg-accent px-3.5 py-1.5 text-[10px] font-bold uppercase tracking-[0.16em] text-white shadow-sm">
              <span className="truncate">{label}</span>
            </span>

            <h3 className="mt-[17px] max-w-[14.5rem] font-serif text-[1.45rem] font-medium leading-[1.08] tracking-tight text-ink sm:max-w-[16rem] sm:text-[1.65rem] lg:max-w-[17rem]">
              <span className="sm:hidden">{heroTitle.mobile}</span>
              <span className="hidden sm:block">
                <span className="block whitespace-nowrap">{heroTitle.desktopFirstLine}</span>
                {heroTitle.desktopSecondLine ? (
                  <span className="block">{heroTitle.desktopSecondLine}</span>
                ) : null}
              </span>
            </h3>

            {description ? (
              <p className="mt-[13px] line-clamp-2 max-w-[16rem] text-[13px] leading-[1.48] text-ink-muted sm:text-sm">
                {description}
              </p>
            ) : null}

            {attributes.length > 0 ? (
              <div className="mt-5 space-y-[9px] text-[13px] text-ink-soft sm:text-sm">
                {attributes.map((attribute) => {
                  const Icon = attribute.icon;

                  return (
                    <div key={attribute.label} className="flex items-center gap-2.5">
                      <Icon className="mt-px h-4 w-4 shrink-0 text-accent" strokeWidth={1.8} />
                      <span className="leading-[1.45]">{attribute.label}</span>
                    </div>
                  );
                })}
              </div>
            ) : null}
          </div>
        </div>
      </div>

      <div className="border-t border-white/70 bg-white/60 px-4.5 py-3.5 backdrop-blur-sm sm:px-6">
        <div className="space-y-3.5">
          <div className="flex items-start justify-between gap-4">
            <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
              <span className="whitespace-nowrap text-[1.5rem] font-bold tracking-tight text-ink">
                {formatPrice(combo.price)}
              </span>
              {compareAtPrice ? (
                <span className="whitespace-nowrap text-sm text-ink/35 line-through">
                  {formatPrice(compareAtPrice)}
                </span>
              ) : null}
            </div>
            {savings > 0 ? (
              <span className="shrink-0 text-sm font-semibold text-[#0B8A63]">
                Save {formatPrice(savings)}
              </span>
            ) : null}
          </div>

          <div className="border-t border-border/80" />

          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={(event) => {
                event.stopPropagation();
                onOpen(combo);
              }}
              className="inline-flex min-h-10 w-full items-center justify-center gap-1.5 rounded-full border border-ink/10 bg-white/70 px-3.5 py-2 text-sm font-semibold text-ink transition-all hover:border-accent/35 hover:bg-white hover:text-accent sm:px-4"
            >
              <span>View Details</span>
              {/* <ArrowRight className="h-4 w-4" /> */}
            </button>

            <button
              onClick={(event) => {
                event.stopPropagation();
                onAddToCart(combo);
              }}
              disabled={combo.stock <= 0}
              className="inline-flex min-h-10 w-full items-center justify-center gap-1.5 rounded-full bg-accent px-3.5 py-2 text-sm font-semibold text-white shadow-sm transition-all hover:bg-accent-dark hover:shadow disabled:cursor-not-allowed disabled:bg-neutral-200 disabled:text-neutral-500 sm:px-4"
            >
              <span>{combo.stock > 0 ? "Add Bundle" : "Out of Stock"}</span>
              {combo.stock > 0 ? <ArrowRight className="h-4 w-4" /> : null}
            </button>
          </div>
        </div>
      </div>
    </article>
  );
}

function BundleCardSkeleton() {
  return (
    <div className="flex h-full min-w-full snap-start flex-col overflow-hidden rounded-[1.75rem] border border-border/70 bg-[#F8F3EF] shadow-sm lg:min-w-[calc((100%-1.5rem)/2)]">
      <div className="min-h-[336px] p-4 sm:min-h-[368px] sm:p-5.5 lg:min-h-[316px]">
        <div className="h-8 w-32 animate-pulse rounded-full bg-white/80" />
        <div className="mt-4 h-14 w-2/3 animate-pulse rounded-3xl bg-white/80" />
        <div className="mt-3 h-14 w-3/5 animate-pulse rounded-3xl bg-white/70" />
        <div className="mt-6 space-y-2">
          <div className="h-5 w-36 animate-pulse rounded-full bg-white/75" />
          <div className="h-5 w-40 animate-pulse rounded-full bg-white/75" />
          <div className="h-5 w-32 animate-pulse rounded-full bg-white/75" />
        </div>
      </div>
      <div className="border-t border-white/70 bg-white/55 px-4.5 py-3.5 sm:px-6">
        <div className="h-7 w-44 animate-pulse rounded-full bg-ink/[0.05]" />
        <div className="mt-3.5 grid grid-cols-1 gap-2 sm:grid-cols-2">
          <div className="h-10 animate-pulse rounded-full bg-ink/[0.05]" />
          <div className="h-10 animate-pulse rounded-full bg-ink/[0.05]" />
        </div>
      </div>
    </div>
  );
}

export function BundlesCarousel() {
  const router = useRouter();
  const scrollRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(false);
  const [snapPoints, setSnapPoints] = useState<number[]>([]);
  const addItem = useCartStore((s) => s.addItem);
  const addToast = useToastStore((s) => s.addToast);
  const toggleWishlist = useWishlistStore((s) => s.toggleWishlist);
  const isWishlisted = useWishlistStore((s) => s.isWishlisted);
  const togglingWishlistId = useWishlistStore((s) => s.isToggling);
  const { isAuthenticated, _ready } = useAuthStore();
  const {
    data: combos,
    isLoading,
    isError,
    error,
    refetch,
    isFetching,
  } = useCombos();
  const hasMultipleBundles = Boolean(combos && combos.length > 1);

  const updateScrollState = () => {
    const scroller = scrollRef.current;

    if (!scroller) return;

    const maxScrollLeft = scroller.scrollWidth - scroller.clientWidth;
    const nextSnapPoints = Array.from(scroller.children)
      .map((child) => (child as HTMLElement).offsetLeft)
      .filter((offset) => offset <= maxScrollLeft + 4);

    if (
      maxScrollLeft > 4 &&
      (nextSnapPoints.length === 0 ||
        Math.abs(nextSnapPoints[nextSnapPoints.length - 1] - maxScrollLeft) > 4)
    ) {
      nextSnapPoints.push(maxScrollLeft);
    }

    const closestIndex = nextSnapPoints.reduce((closest, point, index) => {
      const currentDistance = Math.abs(point - scroller.scrollLeft);
      const closestDistance = Math.abs(nextSnapPoints[closest] - scroller.scrollLeft);
      return currentDistance < closestDistance ? index : closest;
    }, 0);

    setSnapPoints(nextSnapPoints);
    setActiveIndex(closestIndex);
    setCanScrollPrev(scroller.scrollLeft > 4);
    setCanScrollNext(scroller.scrollLeft < maxScrollLeft - 4);
  };

  useEffect(() => {
    updateScrollState();

    if (typeof window === "undefined") return;

    window.addEventListener("resize", updateScrollState);
    return () => window.removeEventListener("resize", updateScrollState);
  }, [combos?.length]);

  const scroll = (dir: number) => {
    const scroller = scrollRef.current;

    if (!scroller) return;

    const firstCard = scroller.firstElementChild as HTMLElement | null;
    const cardWidth = firstCard?.offsetWidth ?? scroller.clientWidth;

    scroller.scrollBy({ left: dir * (cardWidth + 24), behavior: "smooth" });
  };

  const scrollToSnapPoint = (index: number) => {
    const scroller = scrollRef.current;
    const targetOffset = snapPoints[index];

    if (!scroller || targetOffset == null) return;

    scroller.scrollTo({ left: targetOffset, behavior: "smooth" });
  };

  const handleAdd = (combo: ComboProduct) => {
    addItem(
      {
        ...combo,
        itemType: "combo",
      },
      1
    );
    addToast(`${getComboName(combo)} added to cart`, "success");
  };

  const handleOpen = (combo: ComboProduct) => {
    router.push(`/combo/${combo.slug}`);
  };

  const handleWishlist = async (combo: ComboProduct) => {
    if (!_ready || togglingWishlistId === combo.id) return;

    if (!isAuthenticated) {
      addToast("Please sign in to use your wishlist", "info");
      router.push(`/login?redirect=${encodeURIComponent(window.location.pathname)}`);
      return;
    }

    try {
      const nextState = await toggleWishlist(combo.id, "combo");
      addToast(
        nextState ? `${getComboName(combo)} added to wishlist` : "Removed from wishlist",
        "info"
      );
    } catch {
      addToast("Could not update wishlist. Please try again.", "error");
    }
  };

  const statusCode = (error as { response?: { status?: number } } | undefined)?.response?.status;
  const isNotFoundError = statusCode === 404;

  return (
    <section className="py-14 md:py-20">
      <div className="container mx-auto px-4">
        <div className="mx-auto mb-12 max-w-2xl text-center md:mb-14">
          <p className="text-xs font-bold uppercase tracking-[0.36em] text-accent/70">
            Routines &amp; Sets
          </p>
          <h2 className="mt-3 font-serif text-5xl font-medium leading-none tracking-tight text-ink md:text-6xl">
            Bundles
          </h2>
          <p className="mt-5 text-base text-ink-muted md:text-lg">
            Complete skincare routines, curated for real results.
          </p>
        </div>

        {isLoading ? (
          <div className="relative">
            <div className="scrollbar-none flex snap-x snap-mandatory gap-6 overflow-x-auto pb-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              {Array.from({ length: 2 }).map((_, index) => (
                <BundleCardSkeleton key={index} />
              ))}
            </div>
          </div>
        ) : isError ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-white px-6 py-20 text-center">
            <AlertCircle className="h-16 w-16 text-rose-300" />
            <h3 className="mt-4 text-lg font-semibold text-ink">
              {isNotFoundError ? "Bundles not found" : "Could not load bundles"}
            </h3>
            <p className="mt-2 max-w-sm text-sm text-ink-muted">
              {isNotFoundError
                ? "The combo endpoint returned a not found response."
                : "We ran into a problem fetching the latest bundle offers. Please try again."}
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
              <Button variant="outline" onClick={() => router.push("/shop")}>
                Continue Shopping
              </Button>
            </div>
          </div>
        ) : !combos || combos.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-accent-pale text-accent-dark">
              <Package className="h-7 w-7" />
            </div>
            <h3 className="text-lg font-semibold text-ink">
              No combo offers right now
            </h3>
            <p className="mt-1.5 max-w-sm text-sm text-ink-muted">
              We are putting together new bundles. Check back soon for curated routines and exclusive combo deals.
            </p>
          </div>
        ) : (
          <div className="relative">
            {hasMultipleBundles && canScrollPrev ? (
              <button
                onClick={() => scroll(-1)}
                className="absolute -left-5 top-[42%] z-10 hidden h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full border border-ink/10 bg-white text-ink shadow-sm transition hover:border-accent/30 hover:text-accent hover:shadow md:flex"
                aria-label="Previous bundle"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
            ) : null}

            <div
              ref={scrollRef}
              onScroll={updateScrollState}
              className="scrollbar-none flex snap-x snap-mandatory gap-6 overflow-x-auto pb-5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
            >
              {combos.map((combo, index) => (
                <BundleCard
                  key={combo.id}
                  combo={combo}
                  index={index}
                  onAddToCart={handleAdd}
                  onOpen={handleOpen}
                  onWishlist={handleWishlist}
                  isWishlisted={isWishlisted(combo.id)}
                  isTogglingWishlist={togglingWishlistId === combo.id}
                />
              ))}
            </div>

            {hasMultipleBundles && canScrollNext ? (
              <button
                onClick={() => scroll(1)}
                className="absolute -right-5 top-[42%] z-10 hidden h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full border border-ink/10 bg-white text-ink shadow-sm transition hover:border-accent/30 hover:text-accent hover:shadow md:flex"
                aria-label="Next bundle"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            ) : null}

            {hasMultipleBundles ? (
              <div className="mt-3 flex items-center justify-center gap-3">
                {snapPoints.map((snapPoint, index) => (
                  <button
                    key={snapPoint}
                    type="button"
                    onClick={() => scrollToSnapPoint(index)}
                    aria-label={`Go to bundle page ${index + 1}`}
                    className={cn(
                      "h-2 rounded-full transition-all",
                      activeIndex === index
                        ? "w-9 bg-ink"
                        : "w-5 bg-ink/15 hover:bg-ink/30"
                    )}
                  />
                ))}
              </div>
            ) : null}
          </div>
        )}
      </div>
    </section>
  );
}
