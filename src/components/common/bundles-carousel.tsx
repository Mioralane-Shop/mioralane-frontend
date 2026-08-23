"use client";

import { useRef } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { AlertCircle, Loader2, Package } from "lucide-react";
import { useCartStore } from "@/store/cart.store";
import { formatPrice } from "@/lib/utils";
import { SectionHeading } from "@/components/common/section-heading";
import { Button } from "@/components/ui/button";
import { useCombos } from "@/hooks/use-combos";
import type { ComboProduct } from "@/services/combo.service";

const CARD_STYLES = [
  {
    gradient: "linear-gradient(135deg,#FBDDE2,#F2D4DA)",
    accent: "#D4637A",
  },
  {
    gradient: "linear-gradient(135deg,#D8E8D4,#C2D8BE)",
    accent: "#2D5A3D",
  },
  {
    gradient: "linear-gradient(135deg,#F0E8DC,#E4D8C8)",
    accent: "#8B7355",
  },
  {
    gradient: "linear-gradient(135deg,#DCE8F5,#C8D8EC)",
    accent: "#3D5A80",
  },
] as const;

function getSavings(combo: ComboProduct) {
  const compareAtPrice = combo.compareAtPrice ?? 0;
  return combo.savings ?? (compareAtPrice > combo.price ? compareAtPrice - combo.price : 0);
}

function getCompareAtPrice(combo: ComboProduct) {
  const compareAtPrice = combo.compareAtPrice ?? 0;

  if (compareAtPrice > combo.price) {
    return compareAtPrice;
  }

  const savings = getSavings(combo);
  return savings > 0 ? combo.price + savings : undefined;
}

function BundleCard({
  combo,
  index,
  onAddToCart,
  onOpen,
}: {
  combo: ComboProduct;
  index: number;
  onAddToCart: (combo: ComboProduct) => void;
  onOpen: (combo: ComboProduct) => void;
}) {
  const style = CARD_STYLES[index % CARD_STYLES.length];
  const image = combo.images?.[0] ?? "";
  const savings = getSavings(combo);
  const compareAtPrice = getCompareAtPrice(combo);
  const badge = combo.badge || combo.routineTag || "BUNDLE";

  return (
    <div
      role="link"
      tabIndex={0}
      onClick={() => onOpen(combo)}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          onOpen(combo);
        }
      }}
      className="flex min-w-[320px] snap-start cursor-pointer flex-col justify-between overflow-hidden rounded-2xl p-6 md:min-w-[360px]"
      style={{ background: style.gradient }}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <span
            className="inline-block rounded-full px-3 py-1 text-xs font-semibold"
            style={{
              background: "rgba(255,255,255,0.75)",
              color: style.accent,
            }}
          >
            {badge}
          </span>
          <h3 className="mt-3 text-xl font-semibold text-ink">
            {combo.name}
          </h3>
        </div>

        {image ? (
          <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-2xl border border-white/60 bg-white/50 shadow-sm">
            <Image
              src={image}
              alt={combo.name}
              fill
              sizes="64px"
              className="object-cover"
            />
          </div>
        ) : null}
      </div>

      <div className="mt-4 flex items-center gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xl font-bold text-ink">
            {formatPrice(combo.price)}
          </span>
          {compareAtPrice ? (
            <span className="text-sm text-ink/40 line-through">
              {formatPrice(compareAtPrice)}
            </span>
          ) : null}
          {savings > 0 ? (
            <span className="rounded-full bg-brand/10 px-2 py-0.5 text-xs font-medium text-brand">
              Save {formatPrice(savings)}
            </span>
          ) : null}
        </div>
      </div>

      <button
        onClick={(event) => {
          event.stopPropagation();
          onAddToCart(combo);
        }}
        disabled={combo.stock <= 0}
        className="mt-4 w-full rounded-full py-2.5 text-sm font-medium text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:bg-white/40 disabled:text-white/60"
        style={{ background: style.accent }}
      >
        {combo.stock > 0 ? "Add Bundle ->" : "Out of Stock"}
      </button>
    </div>
  );
}

export function BundlesCarousel() {
  const router = useRouter();
  const scrollRef = useRef<HTMLDivElement>(null);
  const addItem = useCartStore((s) => s.addItem);
  const {
    data: combos,
    isLoading,
    isError,
    error,
    refetch,
    isFetching,
  } = useCombos();

  const scroll = (dir: number) => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: dir * 380, behavior: "smooth" });
    }
  };

  const handleAdd = (combo: ComboProduct) => {
    addItem(
      {
        ...combo,
        itemType: "combo",
      },
      1
    );
  };

  const handleOpen = (combo: ComboProduct) => {
    router.push(`/combo/${combo.slug}`);
  };

  const statusCode = (error as { response?: { status?: number } } | undefined)?.response?.status;
  const isNotFoundError = statusCode === 404;

  return (
    <section className="py-12 md:py-16">
      <div className="container mx-auto px-4">
        <div className="mb-10 text-center">
          <SectionHeading title="BUNDLES" />
        </div>

        {isLoading ? (
          <div className="relative">
            <div className="scrollbar-none flex gap-5 overflow-x-auto pb-4 snap-x snap-mandatory">
              {Array.from({ length: 3 }).map((_, index) => (
                <div
                  key={index}
                  className="min-w-[320px] snap-start rounded-2xl bg-neutral-100 p-6 md:min-w-[360px]"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 space-y-3">
                      <div className="h-7 w-24 animate-pulse rounded-full bg-white/70" />
                      <div className="h-8 w-3/4 animate-pulse rounded-full bg-white/70" />
                    </div>
                    <div className="h-16 w-16 animate-pulse rounded-2xl bg-white/70" />
                  </div>
                  <div className="mt-8 h-7 w-1/2 animate-pulse rounded-full bg-white/70" />
                  <div className="mt-4 h-11 w-full animate-pulse rounded-full bg-white/70" />
                </div>
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
            <button
              onClick={() => scroll(-1)}
              className="absolute -left-5 top-1/2 z-10 hidden h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-neutral-200 bg-white shadow-md transition hover:shadow-lg md:flex"
              aria-label="Previous bundle"
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
              >
                <path d="m15 18-6-6 6-6" />
              </svg>
            </button>

            <div
              ref={scrollRef}
              className="scrollbar-none flex gap-5 overflow-x-auto pb-4 snap-x snap-mandatory"
            >
              {combos.map((combo, index) => (
                <BundleCard
                  key={combo.id}
                  combo={combo}
                  index={index}
                  onAddToCart={handleAdd}
                  onOpen={handleOpen}
                />
              ))}
            </div>

            <button
              onClick={() => scroll(1)}
              className="absolute -right-5 top-1/2 z-10 hidden h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-neutral-200 bg-white shadow-md transition hover:shadow-lg md:flex"
              aria-label="Next bundle"
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
              >
                <path d="m9 18 6-6-6-6" />
              </svg>
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
