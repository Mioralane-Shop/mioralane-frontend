"use client";

import { useEffect } from "react";
import Link from "next/link";
import {
  AlertTriangle,
  Check,
  ChevronDown,
  Clock,
  Heart,
  Loader2,
  ShoppingBag,
  Trash2,
  TrendingDown,
  XCircle,
} from "lucide-react";
import { RequireAuth } from "@/components/common/require-auth";
import { ProductImage } from "@/components/common/product-image";
import { useWishlistStore } from "@/store/wishlist.store";
import { useAuthStore } from "@/store/auth.store";
import { useToastStore } from "@/store/toast.store";
import { cn, formatPrice } from "@/lib/utils";
import type { WishlistEntry, WishlistSort } from "@/types/wishlist";

const WISHLIST_SORT_OPTIONS: Array<{ label: string; value: WishlistSort }> = [
  { label: "Newest", value: "newest" },
  { label: "Price: Low to High", value: "price-asc" },
  { label: "Price: High to Low", value: "price-desc" },
  { label: "Availability", value: "availability" },
];

function getWishlistItemHref(entry: WishlistEntry) {
  return entry.itemType === "combo"
    ? `/combo/${entry.product.slug}`
    : `/product/${entry.product.slug}`;
}

function StockBadge({ entry }: { entry: WishlistEntry }) {
  if (entry.isPreOrder) {
    return (
      <span
        className={cn(
          "inline-flex items-center gap-1.5 text-xs font-semibold",
          entry.isAvailable ? "text-amber-600" : "text-ink/45",
        )}
      >
        <Clock className="h-3.5 w-3.5" />
        {entry.isAvailable ? "Pre-order" : "Pre-order full"}
      </span>
    );
  }

  if (entry.stockStatus === "out_of_stock") {
    return (
      <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-ink/45">
        <XCircle className="h-3.5 w-3.5" />
        Out of Stock
      </span>
    );
  }

  if (entry.stockStatus === "low_stock") {
    return (
      <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-amber-600">
        <AlertTriangle className="h-3.5 w-3.5" />
        Low Stock · {entry.stock} left
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700">
      <Check className="h-3.5 w-3.5" />
      In Stock
    </span>
  );
}

function PriceDropBadge({ entry }: { entry: WishlistEntry }) {
  if (!entry.hasPriceDrop) {
    return null;
  }

  return (
    <div className="mt-3 rounded-xl bg-emerald-50 px-3 py-2">
      <p className="flex items-center gap-1.5 text-xs font-semibold text-emerald-700">
        <TrendingDown className="h-3.5 w-3.5" />
        Price dropped by {formatPrice(entry.priceDrop)}
      </p>
      <p className="mt-0.5 text-[11px] text-emerald-700/70">
        Added at {formatPrice(entry.priceAtAdd)}
      </p>
    </div>
  );
}

function SortControl({
  sort,
  disabled,
  onChange,
}: {
  sort: WishlistSort;
  disabled?: boolean;
  onChange: (value: WishlistSort) => void;
}) {
  return (
    <label className="flex items-center gap-2 text-sm text-ink/60">
      <span className="whitespace-nowrap">Sort by</span>
      <span className="relative">
        <select
          value={sort}
          disabled={disabled}
          onChange={(event) => onChange(event.target.value as WishlistSort)}
          className="h-11 min-w-[180px] appearance-none rounded-full border border-border bg-white pl-4 pr-10 text-sm font-medium text-ink shadow-sm outline-none transition-colors focus:border-accent/40 disabled:cursor-wait disabled:opacity-60"
        >
          {WISHLIST_SORT_OPTIONS.map((option) => (
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

function WishlistItemCard({ entry }: { entry: WishlistEntry }) {
  const moveToCart = useWishlistStore((s) => s.moveToCart);
  const removeItem = useWishlistStore((s) => s.removeItem);
  const isRemoving = useWishlistStore((s) => s.isToggling === entry.itemId);
  const isMoving = useWishlistStore((s) => s.movingItemId === entry.itemId);
  const addToast = useToastStore((s) => s.addToast);

  const { product } = entry;
  const itemHref = getWishlistItemHref(entry);
  const canMoveToCart = entry.isAvailable && !isMoving && !isRemoving;

  const handleMoveToCart = async () => {
    try {
      const moved = await moveToCart(entry);

      if (moved) {
        addToast(`${product.name} moved to cart`, "success");
        return;
      }

      addToast("This item is out of stock right now. It stays in your wishlist.", "error");
    } catch {
      addToast("Could not move this item to your cart. Please try again.", "error");
    }
  };

  const handleRemove = async () => {
    try {
      await removeItem(entry.itemId, entry.itemType);
      addToast("Removed from wishlist", "info");
    } catch {
      addToast("Could not remove item. Please try again.", "error");
    }
  };

  return (
    <article className="group flex flex-col overflow-hidden rounded-2xl border border-border-light bg-white shadow-sm transition-shadow hover:shadow-md">
      <Link
        href={itemHref}
        className="relative block aspect-square overflow-hidden bg-ink/[0.03]"
      >
        <ProductImage
          src={product.images?.[0] || "/logo/logo_icon.svg"}
          alt={product.name}
          fallbackId={product.id}
          fill
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          className="object-cover transition-transform duration-300 group-hover:scale-[1.03]"
          deliveryPreset="productCard"
        />
        <span className="absolute left-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-white/90 text-brand-500 shadow-sm">
          <Heart className="h-4 w-4 fill-current" />
        </span>
      </Link>

      <div className="flex flex-1 flex-col p-4">
        <p className="text-[11px] font-bold uppercase tracking-wider text-accent">
          {product.brand}
        </p>
        <Link
          href={itemHref}
          className="mt-1 line-clamp-2 text-sm font-semibold leading-snug text-ink transition-colors hover:text-accent"
        >
          {product.name}
        </Link>

        <div className="mt-3 flex items-baseline gap-2">
          <span className="text-base font-bold text-ink">
            {formatPrice(entry.currentPrice)}
          </span>
          {entry.compareAtPrice && entry.compareAtPrice > entry.currentPrice ? (
            <span className="text-xs text-ink/40 line-through">
              {formatPrice(entry.compareAtPrice)}
            </span>
          ) : null}
        </div>

        <PriceDropBadge entry={entry} />

        <div className="mt-3">
          <StockBadge entry={entry} />
        </div>

        <div className="mt-auto grid grid-cols-[1fr_auto] gap-2 pt-4">
          <button
            onClick={handleMoveToCart}
            disabled={!canMoveToCart}
            className={cn(
              "inline-flex h-10 items-center justify-center gap-2 rounded-full px-3 text-sm font-semibold transition-colors",
              canMoveToCart
                ? "bg-accent text-white hover:bg-accent-dark"
                : "cursor-not-allowed bg-neutral-100 text-neutral-400",
            )}
          >
            {isMoving ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <ShoppingBag className="h-4 w-4" />
            )}
            {isMoving ? "Moving..." : entry.isAvailable ? "Move to Cart" : "Out of Stock"}
          </button>
          <button
            onClick={handleRemove}
            disabled={isRemoving || isMoving}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-ink/10 text-ink/50 transition-colors hover:border-brand-200 hover:bg-brand-50 hover:text-brand-500 disabled:cursor-wait disabled:opacity-60"
            aria-label={`Remove ${product.name} from wishlist`}
          >
            {isRemoving ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Trash2 className="h-4 w-4" />
            )}
          </button>
        </div>
      </div>
    </article>
  );
}

export default function WishlistPage() {
  const { items, isLoading, error, fetchWishlist, sort, setSort } = useWishlistStore();
  const { isAuthenticated, _ready } = useAuthStore();

  useEffect(() => {
    if (!_ready || !isAuthenticated) {
      return;
    }

    fetchWishlist().catch(() => {
      // The page keeps the existing state and shows an empty/error-safe surface.
    });
  }, [fetchWishlist, isAuthenticated, _ready]);

  const isInitialLoading = isLoading && items.length === 0;

  return (
    <RequireAuth>
      <div className="mx-auto max-w-[1400px] px-4 py-8 sm:px-6">
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-brand-50">
              <Heart className="h-5 w-5 fill-brand-500 text-brand-500" />
            </div>
            <div>
              <h1 className="font-serif text-2xl font-medium text-ink">
                My Wishlist
              </h1>
              <p className="text-sm text-ink/50">
                {items.length} {items.length === 1 ? "item" : "items"} saved
              </p>
            </div>
          </div>

          {items.length > 0 ? (
            <SortControl
              sort={sort}
              disabled={isLoading}
              onChange={(value) => {
                void setSort(value).catch(() => {
                  // The store keeps the previous list and surfaces `error`.
                });
              }}
            />
          ) : null}
        </div>

        {isInitialLoading ? (
          <div className="flex min-h-[320px] items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-accent" />
          </div>
        ) : error && items.length === 0 ? (
          <div className="flex min-h-[360px] flex-col items-center justify-center rounded-2xl border border-border-light bg-white px-6 py-16 text-center">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-brand-50">
              <Heart className="h-7 w-7 text-brand-300" />
            </div>
            <h2 className="text-lg font-semibold text-ink">
              Could not load your wishlist
            </h2>
            <p className="mb-6 mt-1 max-w-sm text-sm text-ink/50">
              We ran into a problem loading your saved items. Please try again.
            </p>
            <button
              type="button"
              onClick={() => fetchWishlist()}
              className="rounded-full bg-accent px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-accent-dark no-underline"
            >
              Retry
            </button>
          </div>
        ) : items.length === 0 ? (
          <div className="flex min-h-[360px] flex-col items-center justify-center rounded-2xl border border-border-light bg-white px-6 py-16 text-center">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-brand-50">
              <Heart className="h-7 w-7 text-brand-300" />
            </div>
            <h2 className="text-lg font-semibold text-ink">
              Your wishlist is empty
            </h2>
            <p className="mb-6 mt-1 max-w-sm text-sm text-ink/50">
              Save your favorite K-beauty picks and come back when you are ready.
            </p>
            <Link
              href="/shop"
              className="rounded-full bg-accent px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-accent-dark no-underline"
            >
              Explore Products
            </Link>
          </div>
        ) : (
          <div
            className={cn(
              "grid grid-cols-1 gap-4 min-[430px]:grid-cols-2 sm:gap-5 lg:grid-cols-3 xl:grid-cols-4",
              isLoading && "opacity-60 transition-opacity",
            )}
          >
            {items.map((entry) => (
              <WishlistItemCard key={entry.id} entry={entry} />
            ))}
          </div>
        )}
      </div>
    </RequireAuth>
  );
}
