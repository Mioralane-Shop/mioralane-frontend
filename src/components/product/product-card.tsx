"use client";

import Image from "next/image";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Heart, ShoppingBag, ShoppingCart, Sparkles } from "lucide-react";
import { cn, formatPrice } from "@/lib/utils";
import { useWishlistStore } from "@/store/wishlist.store";
import { useCartStore } from "@/store/cart.store";
import { useToastStore } from "@/store/toast.store";
import { useAuthStore } from "@/store/auth.store";
import { createImageKitLoader, isImageKitUrl } from "@/lib/imagekit-delivery";
import type { Product } from "@/types/product";

/** Extra metadata for bundle / combo cards (rendered only for combos). */
export interface ComboCardMeta {
  /** Image badge label, e.g. "TRAVEL KIT", "MORNING PACK", "ACNE COMBO" */
  badge?: string;
  /** Total amount saved (BDT), e.g. 350 -> "Save ৳350 when bought together" */
  savings?: number;
  /** Short included-product names, e.g. ["Cleanser", "Toner", "Serum"] */
  includedItems?: string[];
  /** Routine tag, e.g. "For Dry Skin", "For Acne Care" */
  routineTag?: string;
}

interface ProductCardProps {
  product: Product;
  onNavigate?: (product: Product) => void;
  /** Optional combo metadata - renders the extra bundle features on the card */
  combo?: ComboCardMeta;
  /** Compact image treatment used by the Featured Products homepage grid */
  compactImage?: boolean;
  /** Shop listing can switch between a compact grid card and a wider list row. */
  layout?: "grid" | "list";
}

/** Compute discount percentage from original vs. current price */
function discountPercent(price: number, compareAt?: number): number {
  if (!compareAt || compareAt <= price) return 0;
  return Math.round(((compareAt - price) / compareAt) * 100);
}

function formatCategoryLabel(category: string): string {
  const normalized = category.trim().toLowerCase();
  if (normalized === "sun-care" || normalized === "sunscreen") return "SUNSCREEN";
  return category.replace(/-/g, " ").toUpperCase();
}

function formatVolumeLabel(product: Product): string {
  return (product.volume ?? product.size ?? "").trim();
}

/** "3-piece set" -> "3-PIECE SET" - bundle descriptor for the combo top row */
function comboSetLabel(product: Product): string {
  const size = (product.size ?? product.volume ?? "").trim();
  return size ? size.toUpperCase() : "BUNDLE";
}

const UI_COLORS = {
  cart: "bg-accent text-white hover:bg-accent-dark",
  discount:
    "isolate inline-flex h-6 items-center justify-center overflow-hidden rounded-full border border-[#D8C9B4] bg-[#EEE7DA] px-[10px] text-[11px] font-semibold leading-none text-[#79664B]",
  newBadge: "bg-[#DDEBFF] text-[#4C78B8]",
  bestBadge: "bg-[#E8D8B0] text-[#8A6A2B]",
};

const PRODUCT_CARD_IMAGEKIT_LOADER = createImageKitLoader({ preset: "productCard" });

export function ProductCard({
  product,
  onNavigate,
  combo,
  compactImage,
  layout = "grid",
}: ProductCardProps) {
  const router = useRouter();
  const [mainImgSrc, setMainImgSrc] = useState<string>(product.images?.[0] ?? "");
  const [mainFailed, setMainFailed] = useState<boolean>(false);

  const isWishlisted = useWishlistStore((s) => s.isWishlisted(product.id));
  const toggleWishlist = useWishlistStore((s) => s.toggleWishlist);
  const isTogglingWishlist = useWishlistStore((s) => s.isToggling === product.id);
  const { isAuthenticated, _ready } = useAuthStore();
  const addItem = useCartStore((s) => s.addItem);
  const toggleCart = useCartStore((s) => s.toggleCart);
  const itemType = product.itemType ?? (product.category === "combo" ? "combo" : "product");
  const isInCart = useCartStore((s) =>
    s.items.some(
      (item) =>
        (item.itemId || item.product.id) === product.id &&
        (item.itemType ?? item.product.itemType ?? (item.product.category === "combo" ? "combo" : "product")) === itemType
    )
  );
  const addToast = useToastStore((s) => s.addToast);

  const discount = discountPercent(product.price, product.compareAtPrice);
  const displayCompareAt =
    product.compareAtPrice && product.compareAtPrice > product.price
      ? product.compareAtPrice
      : undefined;
  const volumeLabel = formatVolumeLabel(product);
  const isOutOfStock = product.stock <= 0;
  const cardHref = itemType === "combo" ? `/combo/${product.slug}` : `/product/${product.slug}`;
  const productCardImageLoader = isImageKitUrl(mainImgSrc) ? PRODUCT_CARD_IMAGEKIT_LOADER : undefined;
  const isListLayout = layout === "list";

  const handleClick = () => {
    if (onNavigate) {
      onNavigate(product);
    } else if (typeof window !== "undefined") {
      window.location.href = cardHref;
    }
  };

  const handleWishlist = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!_ready || isTogglingWishlist) return;

    if (!isAuthenticated) {
      addToast("Please sign in to use your wishlist", "info");
      router.push(`/login?redirect=${encodeURIComponent(window.location.pathname)}`);
      return;
    }

    try {
      const nextState = await toggleWishlist(product.id, itemType);
      addToast(nextState ? `${product.name} added to wishlist` : "Removed from wishlist", "info");
    } catch {
      addToast("Could not update wishlist. Please try again.", "error");
    }
  };

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    addItem(
      {
        ...product,
        itemType,
      },
      1
    );
    addToast(`${product.name} added to cart`, "success");
  };

  const handleViewCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleCart();
  };

  /* Combo-specific metadata (only for combo cards) */
  const isCombo = product.category === "combo" || !!combo;
  const comboSavings = isCombo
    ? combo?.savings ??
    (product.compareAtPrice && product.compareAtPrice > product.price
      ? product.compareAtPrice - product.price
      : 0)
    : 0;
  const comboIncludedItems =
    isCombo && combo?.includedItems && combo.includedItems.length > 0
      ? combo.includedItems
      : null;
  const comboRoutineTag = isCombo ? combo?.routineTag : undefined;
  const badgeLabel = !isCombo
    ? product.isNew || product.tag === "new"
      ? "NEW"
      : product.isBestSeller || product.tag === "best"
        ? "BEST SELLER"
        : null
    : null;
  const badgeClass =
    badgeLabel === "NEW"
      ? UI_COLORS.newBadge
      : badgeLabel === "BEST SELLER"
        ? UI_COLORS.bestBadge
        : "";

  if (!isCombo) {
    return (
      <div
        onClick={handleClick}
        className={cn(
          "group flex h-full w-full cursor-pointer overflow-hidden bg-surface transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md",
          isListLayout ? "flex-row gap-5 border-b border-border-light py-4" : "flex-col"
        )}
        id={`product-card-${product.id}`}
      >
        <div
          className={cn(
            "relative overflow-hidden bg-[#FAF8F6]",
            isListLayout
              ? "h-36 w-28 shrink-0"
              : compactImage
                ? "aspect-square w-full"
                : "aspect-[3/4] w-full"
          )}
        >
          {discount > 0 && (
            <div className="absolute right-3 top-3 left-auto z-30">
              <span className={`discount-running-border relative isolate whitespace-nowrap uppercase tracking-wide ${UI_COLORS.discount}`}>
                <span className="relative z-10">SAVE {discount}%</span>
              </span>
            </div>
          )}

          {!discount && badgeLabel && (
            <div
              className={`absolute right-3 top-3 z-30 whitespace-nowrap rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide shadow-sm ${badgeClass}`}
            >
              {badgeLabel}
            </div>
          )}

          <button
            onClick={handleWishlist}
            disabled={isTogglingWishlist}
            className={cn(
              "absolute left-3 top-3 z-20 flex h-9 w-9 items-center justify-center rounded-full bg-white/95 shadow-sm transition-transform duration-150 hover:scale-105",
              isWishlisted ? "text-accent fill-accent" : "text-ink-muted hover:text-accent",
              isTogglingWishlist && "cursor-wait opacity-70"
            )}
            title={isWishlisted ? "Remove from Wishlist" : "Add to Wishlist"}
            aria-label={isWishlisted ? "Remove from Wishlist" : "Add to Wishlist"}
          >
            <Heart className={cn("h-4 w-4", isWishlisted && "fill-current")} />
          </button>

          {!mainFailed && mainImgSrc ? (
            <Image
              src={mainImgSrc}
              alt={product.name}
              fill
              referrerPolicy="no-referrer"
              loader={productCardImageLoader}
              sizes="(max-width: 640px) calc((100vw - 24px) / 2), (max-width: 1024px) calc((100vw - 52px) / 3), 320px"
              className="object-cover transition-transform duration-300 ease-out group-hover:scale-[1.05]"
              loading="lazy"
              onError={() => {
                const idx = product.images?.indexOf(mainImgSrc) ?? -1;
                const nextImg = idx >= 0 ? product.images?.[idx + 1] : undefined;
                if (nextImg && nextImg !== mainImgSrc) {
                  setMainImgSrc(nextImg);
                } else {
                  setMainFailed(true);
                }
              }}
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center rounded-2xl bg-ink/[0.04]">
              <Sparkles className="h-8 w-8 text-ink-muted/40" />
            </div>
          )}
        </div>

        <div
          className={cn(
            "flex flex-1 flex-col",
            isListLayout ? "justify-center pr-3" : "px-0 pb-1 pt-4"
          )}
        >
          <div>
            <div className="mb-1.5 text-[10px] font-medium uppercase tracking-[0.16em] text-ink-muted">
              {formatCategoryLabel(product.category)}
            </div>

            <h3 className="line-clamp-1 text-sm font-medium leading-snug text-ink">
              {product.name}
            </h3>
            <p className="mt-1 text-xs text-ink-muted">{product.brand}</p>

            <div className="mt-3 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs">
              <span
                className={cn(
                  "font-medium",
                  product.stock > 0 ? "text-success" : "text-ink-muted line-through"
                )}
              >
                {product.stock > 0 ? "In Stock" : "Out of Stock"}
              </span>
              {volumeLabel && (
                <>
                  <span className="text-border">|</span>
                  <span className="font-normal text-ink-soft">
                    {volumeLabel}
                  </span>
                </>
              )}
            </div>
          </div>

          <div
            className={cn(
              "mt-4 flex gap-3",
              isListLayout
                ? "items-center justify-between"
                : "flex-col items-stretch"
            )}
          >
            <div className="flex min-w-0 flex-wrap items-baseline justify-start gap-1.5">
              <span className="whitespace-nowrap text-base font-semibold tracking-tight text-ink">
                {formatPrice(product.price)}
              </span>
              {displayCompareAt && (
                <span className="whitespace-nowrap text-xs font-normal line-through text-ink-muted">
                  {formatPrice(displayCompareAt)}
                </span>
              )}
            </div>

            {isInCart ? (
              <button
                onClick={handleViewCart}
                className="flex shrink-0 items-center justify-center gap-1.5 whitespace-nowrap rounded-full bg-success px-4 py-2.5 text-sm font-medium text-white shadow-sm transition-all duration-150 hover:bg-success/90 active:scale-95"
              >
                <ShoppingCart className="h-4 w-4 shrink-0" />
                <span>View Cart</span>
              </button>
            ) : (
              <button
                onClick={handleAddToCart}
                disabled={isOutOfStock}
                className={cn(
                  "flex shrink-0 items-center justify-center gap-1.5 whitespace-nowrap rounded-full px-4 py-2.5 text-sm font-medium shadow-sm transition-all duration-150 active:scale-95",
                  isOutOfStock
                    ? "cursor-not-allowed bg-neutral-200 text-neutral-500 shadow-none"
                    : UI_COLORS.cart
                )}
              >
                <ShoppingBag className="h-4 w-4 shrink-0" />
                <span>{isOutOfStock ? "Out of Stock" : "Add to Cart"}</span>
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      onClick={handleClick}
      className="group flex h-full w-full cursor-pointer flex-col overflow-hidden rounded-3xl border border-border bg-surface shadow-sm transition-shadow hover:shadow-lg"
      id={`product-card-${product.id}`}
    >
      {/* Image container */}
      <div className="relative m-2 aspect-[3/3] overflow-hidden rounded-2xl bg-[#FAF8F6]">
        {/* Discount badge - combos and single cards */}
        {!isCombo && discount > 0 && (
          <div className="absolute right-3 top-3 left-auto z-30">
            <span className={`discount-running-border relative isolate whitespace-nowrap uppercase tracking-wide ${UI_COLORS.discount}`}>
              <span className="relative z-10">
                SAVE {discount}%
              </span>
            </span>
          </div>
        )}

        {comboSavings > 0 && isCombo && discount > 0 && (
          <div className="absolute right-3 top-3 left-auto z-30">
            <span className={`discount-running-border relative isolate whitespace-nowrap uppercase tracking-wide ${UI_COLORS.discount}`}>
              <span className="relative z-10">
                SAVE {discount}%
              </span>
            </span>
          </div>
        )}

        <button
          onClick={handleWishlist}
          disabled={isTogglingWishlist}
          className={cn(
            "absolute left-3 top-3 z-20 flex h-9 w-9 items-center justify-center rounded-full bg-white/95 shadow-sm transition-transform duration-150 hover:scale-105",
            isWishlisted ? "text-accent fill-accent" : "text-ink-muted hover:text-accent",
            isTogglingWishlist && "cursor-wait opacity-70"
          )}
          title={isWishlisted ? "Remove from Wishlist" : "Add to Wishlist"}
          aria-label={isWishlisted ? "Remove from Wishlist" : "Add to Wishlist"}
        >
          <Heart className={cn("h-4 w-4", isWishlisted && "fill-current")} />
        </button>

        {!mainFailed && mainImgSrc ? (
          <Image
            src={mainImgSrc}
            alt={product.name}
            fill
            referrerPolicy="no-referrer"
            loader={productCardImageLoader}
            sizes="(max-width: 640px) calc((100vw - 24px) / 2), (max-width: 1024px) calc((100vw - 52px) / 3), 420px"
            className="object-cover transition-transform duration-300 ease-out group-hover:scale-[1.02]"
            loading="lazy"
            onError={() => {
              const idx = product.images?.indexOf(mainImgSrc) ?? -1;
              const nextImg = idx >= 0 ? product.images?.[idx + 1] : undefined;
              if (nextImg && nextImg !== mainImgSrc) {
                setMainImgSrc(nextImg);
              } else {
                setMainFailed(true);
              }
            }}
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center rounded-2xl bg-ink/[0.04]">
            <Sparkles className="h-8 w-8 text-ink-muted/40" />
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex flex-1 flex-col justify-between px-4 pb-4 pt-0 sm:px-5 sm:pb-5">
        <div>
          {/* Combo top row - bundle descriptor (left) + savings (right) */}
          {isCombo && (
            <div className="mb-2 flex items-center justify-between gap-2">
              <span className="min-w-0 truncate text-[11px] font-bold uppercase tracking-wider text-accent sm:text-xs lg:text-[10px]">
                BUNDLE · {comboSetLabel(product)}
              </span>
              {comboSavings > 0 && (
                <span className="shrink-0 whitespace-nowrap text-[14px] font-bold text-emerald-700 sm:text-xs lg:text-[14px]">
                  Save {formatPrice(comboSavings)}
                </span>
              )}
            </div>
          )}

          {/* Brand and category - non-combo cards only */}
          {!isCombo && (
            <div className="mb-1.5 text-[11px] font-bold uppercase tracking-wider text-accent sm:text-xs lg:text-[10px]">
              {product.brand} <span className="text-accent-light">{"\u00b7"}</span> {formatCategoryLabel(product.category)}
            </div>
          )}

          {/* Product name */}
          <h3
            className={cn(
              "line-clamp-2 text-[15px] font-semibold leading-snug text-ink sm:text-[17px] lg:text-base xl:text-base"
            )}
          >
            {product.name}
          </h3>

          {/* Combo included items */}
          {comboIncludedItems && (
            <p className="mb-2.5 mt-0.5 truncate text-sm font-normal leading-tight text-ink-soft">
              {comboIncludedItems.join(" + ")}
            </p>
          )}

          {/* In stock and volume - non-combo cards only */}
          {!isCombo && (
            <div className="mt-2.5 flex flex-wrap items-center gap-x-2 gap-y-0.5">
              <span
                className={cn(
                  "h-1.5 w-1.5 rounded-full",
                  product.stock > 0 ? "animate-stock-radar bg-[#1F6B4E]" : "bg-ink-muted"
                )}
              />
              <span
                className={cn(
                  "text-[10px] font-bold uppercase tracking-wider sm:text-[11px] lg:text-[10px]",
                  product.stock > 0 ? "text-[#1F6B4E]" : "text-ink-muted"
                )}
              >
                {product.stock > 0 ? "IN STOCK" : "OUT OF STOCK"}
              </span>
              {volumeLabel && (
                <>
                  <span className="text-border text-[10px]">|</span>
                  <span className="text-[11px] font-medium tracking-normal text-ink-soft sm:text-xs lg:text-[10px]">
                    {volumeLabel}
                  </span>
                </>
              )}
            </div>
          )}

          {/* Combo routine tag - bottom of card, above price section */}
          {comboRoutineTag && (
            <div className="mt-2 flex items-center sm:mt-2.5 lg:mt-2">
              <span className="inline-flex items-center rounded-full border border-accent/25 bg-accent-pale/50 px-2 py-0.5 text-[9px] font-semibold text-accent-dark sm:text-[10px] lg:text-[9px]">
                {comboRoutineTag}
              </span>
            </div>
          )}
        </div>

        {/* Footer: Price + Add to Cart */}
        <div className="mt-4 flex flex-row items-center justify-between gap-3 border-t border-border-light/60 pt-3 max-[360px]:flex-col max-[360px]:items-stretch max-[360px]:gap-2.5">
          {/* Price */}
          <div className="flex min-w-0 flex-wrap items-baseline justify-start gap-1.5">
            {displayCompareAt && (
              <span className="whitespace-nowrap text-sm font-normal line-through text-ink-soft sm:text-lg lg:text-sm">
                {formatPrice(displayCompareAt)}
              </span>
            )}
            <span className="whitespace-nowrap text-base font-semibold tracking-tight text-ink sm:text-2xl lg:text-lg xl:text-base">
              {formatPrice(product.price)}
            </span>
          </div>

          {/* Add to Cart / View Cart */}
          {isInCart ? (
            <button
              onClick={handleViewCart}
              className="flex shrink-0 items-center justify-center gap-1.5 whitespace-nowrap rounded-full bg-success px-4 py-2 text-xs font-medium text-white transition-all duration-150 hover:bg-success/90 hover:shadow active:scale-95 max-[360px]:w-full sm:px-6 sm:py-3 sm:text-base lg:px-4 lg:py-2 lg:text-xs"
            >
              <ShoppingCart className="h-3.5 w-3.5 shrink-0 sm:h-5 sm:w-5 lg:h-3.5 lg:w-3.5" />
              <span>View Cart</span>
            </button>
          ) : (
            <button
              onClick={handleAddToCart}
              disabled={isOutOfStock}
              className={cn(
                "flex shrink-0 items-center justify-center gap-1.5 whitespace-nowrap rounded-full px-4 py-2 text-xs font-medium transition-all duration-150 max-[360px]:w-full sm:px-6 sm:py-3 sm:text-base lg:px-4 lg:py-2 lg:text-xs",
                isOutOfStock
                  ? "cursor-not-allowed bg-neutral-200 text-neutral-500 shadow-none"
                  : UI_COLORS.cart + " shadow-sm hover:shadow active:scale-95"
              )}
            >
              <ShoppingBag className="h-3.5 w-3.5 shrink-0 sm:h-5 sm:w-5 lg:h-3.5 lg:w-3.5" />
              <span>{isOutOfStock ? "Out of Stock" : "Add to Cart"}</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
