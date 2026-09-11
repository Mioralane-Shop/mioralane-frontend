"use client";

import type { CSSProperties } from "react";
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
import { SectionHeading } from "@/components/common/section-heading";
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
    backgroundColor: "#FBF2F1",
    wash: "bg-[linear-gradient(90deg,rgba(251,242,241,0.99)_0%,rgba(251,242,241,0.98)_40%,rgba(251,242,241,0.84)_54%,rgba(251,242,241,0.42)_66%,rgba(251,242,241,0.08)_80%,rgba(251,242,241,0)_100%)]",
    badge: "bg-brand-500 text-white",
    savings: "bg-brand-100 text-brand-600",
  },
  {
    background: "bg-[#F7F0E8]",
    backgroundColor: "#F7F0E8",
    wash: "bg-[linear-gradient(90deg,rgba(247,240,232,0.99)_0%,rgba(247,240,232,0.98)_40%,rgba(247,240,232,0.84)_54%,rgba(247,240,232,0.42)_66%,rgba(247,240,232,0.08)_80%,rgba(247,240,232,0)_100%)]",
    badge: "bg-[#A88D70] text-white",
    savings: "bg-[#EBDAC8] text-[#8A6A4B]",
  },
  {
    background: "bg-[#F5F0EC]",
    backgroundColor: "#F5F0EC",
    wash: "bg-[linear-gradient(90deg,rgba(245,240,236,0.99)_0%,rgba(245,240,236,0.98)_40%,rgba(245,240,236,0.84)_54%,rgba(245,240,236,0.42)_66%,rgba(245,240,236,0.08)_80%,rgba(245,240,236,0)_100%)]",
    badge: "bg-[#8B7355] text-white",
    savings: "bg-white/70 text-[#7D6651]",
  },
  {
    background: "bg-[#F8F6F1]",
    backgroundColor: "#F8F6F1",
    wash: "bg-[linear-gradient(90deg,rgba(248,246,241,0.99)_0%,rgba(248,246,241,0.98)_40%,rgba(248,246,241,0.84)_54%,rgba(248,246,241,0.42)_66%,rgba(248,246,241,0.08)_80%,rgba(248,246,241,0)_100%)]",
    badge: "bg-[#A68B6B] text-white",
    savings: "bg-[#EEE7DA] text-[#79664B]",
  },
] as const;

function getSavings(combo: ComboProduct) {
  const compareAtPrice = combo.compareAtPrice ?? 0;
  return combo.savings && combo.savings > 0
    ? combo.savings
    : compareAtPrice > combo.price
      ? compareAtPrice - combo.price
      : 0;
}

function getCompareAtPrice(combo: ComboProduct) {
  const compareAtPrice = combo.compareAtPrice ?? 0;

  if (compareAtPrice > combo.price) {
    return compareAtPrice;
  }

  return undefined;
}

function getComboName(combo: ComboProduct) {
  const title = (combo as ComboProduct & { title?: string }).title?.trim() || "";
  return title || combo.name?.trim() || "Bundle";
}

function getComboImage(combo: ComboProduct) {
  return combo.media?.[0]?.url ?? combo.images?.[0] ?? "";
}

function getComboDescription(combo: ComboProduct) {
  return combo.description?.trim() ?? "";
}

function getAttributeRows(combo: ComboProduct) {
  const rows: Array<{
    icon: typeof Layers3;
    label: string;
  }> = [];

  const includedCount = combo.includedItems?.filter(Boolean).length ?? 0;

  if (includedCount > 0) {
    rows.push({
      icon: Layers3,
      label: `${includedCount} Products`,
    });
  }

  const travelLabel = combo.badge?.trim().toLowerCase() === "travel kit" ? "Travel Friendly" : "";
  if (travelLabel) {
    rows.push({ icon: Plane, label: travelLabel });
  }

  const skinTypeSource = combo.skinType as unknown;
  const skinType = Array.isArray(skinTypeSource)
    ? skinTypeSource.filter(Boolean).join(", ").trim()
    : typeof skinTypeSource === "string"
      ? skinTypeSource.trim()
      : "";
  if (skinType) {
    rows.push({ icon: Leaf, label: skinType });
  }

  const routineTag = combo.routineTag?.trim() || "";
  if (routineTag && rows.length < 3) {
    rows.push({ icon: Package, label: routineTag });
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
  const image = getComboImage(combo);
  const savings = getSavings(combo);
  const compareAtPrice = getCompareAtPrice(combo);
  const label = "MIORALANE BUNDLE";
  const description = getComboDescription(combo);
  const attributes = getAttributeRows(combo);
  const hasAnimatedBundleBadge = label === "MIORALANE BUNDLE";

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
        "group relative isolate flex h-full min-w-full snap-start cursor-pointer flex-col overflow-hidden rounded-[1.75rem] border border-border/80 shadow-sm transition-[border-color,box-shadow,background-color] duration-300 hover:border-accent/25 hover:shadow-[0_4px_12px_rgba(26,26,26,0.05)]",
        hasAnimatedBundleBadge && "bundle-card-running-border",
        "lg:min-w-[calc((100%-1.5rem)/2)]",
        treatment.background
      )}
      style={
        hasAnimatedBundleBadge
          ? ({
            "--bundle-card-bg": treatment.backgroundColor,
          } as CSSProperties)
          : undefined
      }
    >
      <div className="relative min-h-[312px] overflow-hidden sm:min-h-[342px] lg:min-h-[292px]">
        <ProductImage
          src={image}
          alt={comboName}
          fill
          sizes="(max-width: 1024px) 100vw, 48vw"
          className="object-cover object-[72%_50%] transition-transform duration-500 ease-out group-hover:scale-[1.012] sm:object-[74%_50%] lg:object-[76%_50%]"
          fallbackId={combo.id}
          deliveryPreset="pdpMain"
        />

        <div
          className={cn(
            "absolute inset-0 transition-opacity duration-300 group-hover:opacity-95",
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

        <div className="relative z-10 flex min-h-[312px] max-w-[19.5rem] flex-col justify-center p-4 pr-20 sm:min-h-[342px] sm:max-w-[22rem] sm:px-5.5 sm:py-5 sm:pr-24 lg:min-h-[292px] lg:w-[50%] lg:max-w-[23rem] lg:pr-8">
          <div>
            <span className="inline-flex max-w-full rounded-full bg-accent px-3.5 py-1.5 text-[10px] font-bold uppercase tracking-[0.16em] text-white shadow-sm">
              <span className="truncate">{label}</span>
            </span>

            <h3 className="mt-[15px] max-w-[15.25rem] font-serif text-[1.45rem] font-medium leading-[1.08] tracking-tight text-ink sm:max-w-[17rem] sm:text-[1.65rem] lg:max-w-[19rem]">
              {comboName}
            </h3>

            {description ? (
              <p className="mt-[11px] line-clamp-2 max-w-[16rem] text-[13px] leading-[1.42] text-[#746D67] sm:max-w-[17rem] sm:text-sm">
                {description}
              </p>
            ) : null}

            {attributes.length > 0 ? (
              <div className="mt-5.5 space-y-[8px] text-[13px] text-[#6F6862] sm:text-sm">
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

      <div className="border-t border-white/70 bg-white/60 px-4.5 py-3 backdrop-blur-sm sm:px-6">
        <div className="space-y-2.5">
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

          <div className="grid grid-cols-1 gap-2 min-[380px]:grid-cols-2">
            <button
              onClick={(event) => {
                event.stopPropagation();
                onOpen(combo);
              }}
              className="inline-flex min-h-10 w-full items-center justify-center gap-1.5 rounded-full border border-ink/10 bg-white/70 px-3.5 py-2 text-sm font-semibold text-ink transition-all hover:border-accent/35 hover:bg-white hover:text-accent sm:px-4"
            >
              <span>View Details</span>
            </button>

            <button
              onClick={(event) => {
                event.stopPropagation();
                onAddToCart(combo);
              }}
              disabled={combo.stock <= 0}
              className="inline-flex min-h-12 w-full items-center justify-center gap-1.5 rounded-full bg-accent px-3.5 py-2 text-sm font-semibold text-white shadow-sm transition-all hover:bg-accent-dark hover:shadow disabled:cursor-not-allowed disabled:bg-neutral-200 disabled:text-neutral-500 sm:px-4"
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
    if (combo.stock <= 0) {
      return;
    }

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
    <section className="home-section bg-[#fef6f7] shadow-[0_6px_24px_rgba(26,26,26,0.04)]">
      <div className="mx-auto max-w-[1440px] px-4">
        <div className="home-section-heading">
          <SectionHeading
            title="BUNDLES & SETS"
            titleClassName="text-[22px] md:text-[25px] lg:text-[29px]"
          />
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
            <AlertCircle className="h-16 w-16 text-brand-300" />
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
