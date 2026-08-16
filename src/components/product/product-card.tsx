"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Heart, ShoppingBag, ShoppingCart, Star, Sparkles } from "lucide-react";
import { cn, formatPrice } from "@/lib/utils";
import { useWishlistStore } from "@/store/wishlist.store";
import { useCartStore } from "@/store/cart.store";
import { useToastStore } from "@/store/toast.store";
import { useAuthStore } from "@/store/auth.store";
import type { Product } from "@/types/product";

/** Extra metadata for bundle / combo cards (rendered only for combos). */
export interface ComboCardMeta {
  /** Image badge label, e.g. "TRAVEL KIT", "MORNING PACK", "ACNE COMBO" */
  badge?: string;
  /** Total amount saved (BDT), e.g. 350 → "Save ৳350 when bought together" */
  savings?: number;
  /** Short included-product names, e.g. ["Cleanser", "Toner", "Serum"] */
  includedItems?: string[];
  /** Routine tag, e.g. "For Dry Skin", "For Acne Care" */
  routineTag?: string;
}

interface ProductCardProps {
  product: Product;
  onNavigate?: (product: Product) => void;
  /** Optional combo metadata — renders the extra bundle features on the card */
  combo?: ComboCardMeta;
}

/** Compute discount percentage from original vs. current price */
function discountPercent(price: number, compareAt?: number): number {
  if (!compareAt || compareAt <= price) return 0;
  return Math.round(((compareAt - price) / compareAt) * 100);
}

/** Parse "100ml" → { ml: 100, flOz: 3.38 } */
function parseVolume(vol?: string): { label: string } | null {
  if (!vol) return null;
  const match = vol.match(/^([\d.]+)\s*ml$/i);
  if (!match) return { label: vol };
  const ml = parseFloat(match[1]);
  const flOz = ml / 29.5735;
  return { label: `${vol} / ${flOz.toFixed(2)} fl. oz.` };
}

/** "3-piece set" → "3-PIECE SET" — bundle descriptor for the combo top row */
function comboSetLabel(product: Product): string {
  const size = (product.size ?? product.volume ?? "").trim();
  return size ? size.toUpperCase() : "BUNDLE";
}

export function ProductCard({ product, onNavigate, combo }: ProductCardProps) {
  const router = useRouter();
  const [mainImgSrc, setMainImgSrc] = useState<string>(
    product.images?.[0] ?? ""
  );
  const [mainFailed, setMainFailed] = useState<boolean>(false);
  // Default hover to the second image if available, otherwise reuse the first image
  const [hoverImgSrc, setHoverImgSrc] = useState<string>(
    product.hoverImage ??
    product.images?.[1] ??
    product.images?.[0] ??
    ""
  );
  const [hoverFailed, setHoverFailed] = useState<boolean>(false);

  const isWishlisted = useWishlistStore((s) => s.isWishlisted(product.id));
  const toggleWishlist = useWishlistStore((s) => s.toggleWishlist);
  const isTogglingWishlist = useWishlistStore(
    (s) => s.isToggling === product.id
  );
  const { isAuthenticated, _ready } = useAuthStore();
  const addItem = useCartStore((s) => s.addItem);
  const toggleCart = useCartStore((s) => s.toggleCart);
  const isInCart = useCartStore((s) =>
    s.items.some((item) => item.product.id === product.id)
  );
  const addToast = useToastStore((s) => s.addToast);

  const discount = discountPercent(product.price, product.compareAtPrice);
  const hasHoverImage = !hoverFailed && !!hoverImgSrc;
  const volumeInfo = parseVolume(product.volume);
  const isOutOfStock = product.stock <= 0;

  const handleClick = () => {
    if (onNavigate) {
      onNavigate(product);
    } else if (typeof window !== "undefined") {
      window.location.href = `/product/${product.slug}`;
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
      const nextState = await toggleWishlist(
        product.id,
        product.category === "combo" ? "combo" : "product"
      );
      addToast(
        nextState
          ? `${product.name} added to wishlist`
          : "Removed from wishlist",
        "info"
      );
    } catch {
      addToast("Could not update wishlist. Please try again.", "error");
    }
  };

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    addItem(
      {
        ...product,
        itemType: product.category === "combo" ? "combo" : "product",
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

  /* Original (struck-through) price — real compareAt for regular products,
     or current price + savings for combo bundles */
  const displayCompareAt =
    product.compareAtPrice && product.compareAtPrice > product.price
      ? product.compareAtPrice
      : isCombo && comboSavings > 0
        ? product.price + comboSavings
        : undefined;

  /* Image badge label — bundle-specific for combos (e.g. "TRAVEL KIT"),
     else tag-based for regular products */
  const badgeLabel = isCombo
    ? (combo?.badge ?? null)
    : product.tag === "best"
      ? "HUMID PICK"
      : product.tag === "new"
        ? "NEW"
        : null;

  return (
    <div
      onClick={handleClick}
      className="group cursor-pointer rounded-3xl border border-border bg-surface shadow-sm transition-shadow hover:shadow-lg flex flex-col overflow-hidden w-full h-full"
      id={`product-card-${product.id}`}
    >
      {/* ── Image Container ── */}
      <div className="relative w-full aspect-[3/3] p-1.5 sm:p-2 lg:p-1 flex items-center justify-center overflow-hidden rounded-2xl m-2 sm:m-2.5 lg:m-2 max-w-[calc(100%-16px)] sm:max-w-[calc(100%-20px)] lg:max-w-[calc(100%-16px)]">
        {/* Discount Badge — only for non-combo products */}
        {!isCombo && discount > 0 && (
          <div className="absolute top-3 right-3 z-20 bg-accent-dark text-accent-pale font-bold text-[10px] sm:text-xs lg:text-[11px] tracking-wide px-2 sm:px-3 lg:px-2.5 py-0.5 sm:py-1 lg:py-0.5 rounded-full shadow-sm uppercase flex items-center gap-1">
            <span>{discount}% OFF</span>
          </div>
        )}

        {/* Badge tag — combo label always shows, Best/New for regular products only when no discount */}
        {badgeLabel && (isCombo || discount === 0) && (
          <div className="absolute top-3 right-3 z-20 bg-accent text-white font-bold text-[10px] sm:text-xs lg:text-[11px] tracking-wide px-2 sm:px-3 lg:px-2.5 py-0.5 sm:py-1 lg:py-0.5 rounded-full shadow-sm uppercase">
            {badgeLabel}
          </div>
        )}

        {/* Wishlist Heart Button */}
        <button
          onClick={handleWishlist}
          disabled={isTogglingWishlist}
          className={cn(
            "absolute top-3 left-3 z-20 w-8 h-8 sm:w-10 sm:h-10 lg:w-8 lg:h-8 rounded-full bg-surface flex items-center justify-center transition-all duration-150 shadow-sm hover:scale-105",
            isWishlisted
              ? "text-accent fill-accent"
              : "text-ink-muted hover:text-accent",
            isTogglingWishlist && "cursor-wait opacity-70"
          )}
          title={isWishlisted ? "Remove from Wishlist" : "Add to Wishlist"}
          aria-label={isWishlisted ? "Remove from Wishlist" : "Add to Wishlist"}
        >
          <Heart
            className={cn(
              "w-4 h-4 sm:w-5 sm:h-5 lg:w-4 lg:h-4",
              isWishlisted && "fill-current"
            )}
          />
        </button>

        {/* Primary Image */}
        {!mainFailed && mainImgSrc ? (
          <img
            src={mainImgSrc}
            alt={product.name}
            referrerPolicy="no-referrer"
            className={cn(
              "w-full h-full object-cover rounded-lg transition-all duration-500 ease-in-out group-hover:scale-105",
              hasHoverImage && "group-hover:opacity-0"
            )}
            loading="lazy"
            onError={() => {
              // Try next image in array before giving up
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
          <div className="w-full h-full flex items-center justify-center rounded-lg bg-ink/[0.04]">
            <Sparkles className="w-8 h-8 text-ink-muted/40" />
          </div>
        )}

        {/* Hover Image (second view) */}
        {hasHoverImage && !hoverFailed && hoverImgSrc && (
          <img
            src={hoverImgSrc}
            alt={`${product.name} alternate view`}
            referrerPolicy="no-referrer"
            className="absolute inset-0 w-full h-full object-cover rounded-lg opacity-0 transition-all duration-500 ease-in-out group-hover:opacity-100 group-hover:scale-105 p-1"
            loading="lazy"
            onError={() => {
              // If hover image is same as main, just hide on failure
              if (hoverImgSrc === mainImgSrc) {
                setHoverFailed(true);
              } else {
                // Try falling back to main image
                setHoverImgSrc(mainImgSrc);
              }
            }}
          />
        )}

      </div>

      {/* ── Content ── */}
      <div className="p-3 sm:p-5 lg:p-3.5 xl:p-4 flex-1 flex flex-col justify-between">
        <div>
          {/* Combo top row — bundle descriptor (left) + savings (right), below the image */}
          {isCombo && (
            <div className="mb-2 flex items-center justify-between gap-2">
              <span className="min-w-0 truncate text-[11px] sm:text-xs lg:text-[10px] font-bold text-accent tracking-wider uppercase">
                BUNDLE · {comboSetLabel(product)}
              </span>
              {comboSavings > 0 && (
                <span className="shrink-0 text-[14px] sm:text-xs lg:text-[14px] font-bold text-emerald-700 whitespace-nowrap">
                  Save {formatPrice(comboSavings)}
                </span>
              )}
            </div>
          )}

          {/* Brand • Category — non-combo cards only */}
          {!isCombo && (
            <div className="mb-1.5 sm:mb-2 lg:mb-1.5 text-[11px] sm:text-xs lg:text-[10px] font-bold text-accent tracking-wider uppercase text-left">
              {product.brand}{" "}
              <span className="text-accent-light">•</span>{" "}
              {product.category === "sun-care"
                ? "Sun Care"
                : product.category.charAt(0).toUpperCase() +
                product.category.slice(1)}
            </div>
          )}

          {/* Product Name */}
          <h3
            className={cn(
              "font-semibold text-ink text-[15px] sm:text-[17px] lg:text-base xl:text-base leading-snug line-clamp-2 group-hover:text-accent-dark transition-colors font-sans",
              !isCombo && "min-h-[2.25rem] sm:min-h-[2.5rem] lg:min-h-[2.25rem]"
            )}
          >
            {product.name}
          </h3>

          {/* Combo included items */}
          {comboIncludedItems && (
            <p className="mt-0.5 mb-2.5 text-sm  font-base text-ink-soft leading-tight truncate">
              {comboIncludedItems.join(" + ")}
            </p>
          )}

          {/* In Stock + Volume — non-combo cards only */}
          {!isCombo && (
            <div className="mt-3 sm:mt-4 lg:mt-3 flex flex-wrap items-center gap-x-1 gap-y-0.5">
              <span
                className={cn(
                  "w-1 h-1 rounded-full",
                  product.stock > 0
                    ? "bg-success animate-pulse"
                    : "bg-ink-muted"
                )}
              />
              <span
                className={cn(
                  "text-[11px] sm:text-xs lg:text-[10px] font-bold tracking-wider uppercase",
                  product.stock > 0 ? "text-success" : "text-ink-muted"
                )}
              >
                {product.stock > 0 ? "IN STOCK" : "OUT OF STOCK"}
              </span>
              {volumeInfo && (
                <>
                  <span className="text-border text-[10px]">•</span>
                  <span className="text-[11px] sm:text-xs lg:text-[10px] text-ink-soft font-medium">
                    {volumeInfo.label}
                  </span>
                </>
              )}
            </div>
          )}

          {/* Star Rating */}
          <div
            className={cn(
              "flex items-center gap-1 text-xs sm:text-sm lg:text-xs",
              isCombo ? "mb-0" : "mt-1.5 sm:mt-2 lg:mt-1.5"
            )}
          >
            <div className="flex items-center text-gold">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={cn(
                    "w-3.5 h-3.5 sm:w-4 sm:h-4 lg:w-3 lg:h-3",
                    i < Math.floor(product.rating)
                      ? "fill-gold text-gold"
                      : "fill-border-light text-border-light"
                  )}
                />
              ))}
            </div>
            <span className="font-semibold text-ink ml-1">
              {product.rating}
            </span>
            <span className="text-ink-muted">
              ({product.reviewCount})
            </span>
          </div>

          {/* Combo routine tag — bottom of card, above price section */}
          {comboRoutineTag && (
            <div className="mt-2 sm:mt-2.5 lg:mt-2 flex items-center">
              <span className="inline-flex items-center rounded-full border border-accent/25 bg-accent-pale/50 px-2 py-0.5 text-[9px] sm:text-[10px] lg:text-[9px] font-semibold text-accent-dark">
                {comboRoutineTag}
              </span>
            </div>
          )}
        </div>

        {/* ── Footer: Price + Add to Cart ── */}
        <div className="mt-3 sm:mt-5 lg:mt-4 pt-3 sm:pt-4 lg:pt-3.5 border-t border-border-light flex flex-row items-center justify-between gap-2 max-[360px]:flex-col max-[360px]:items-stretch max-[360px]:gap-2.5">
          {/* Price — always left-aligned, both prices side-by-side */}
          <div className="flex items-baseline gap-1.5 flex-wrap justify-start min-w-0">
            {displayCompareAt && (
              <span className="text-ink-soft text-xs sm:text-base lg:text-xs line-through font-normal whitespace-nowrap">
                {formatPrice(displayCompareAt)}
              </span>
            )}
            <span className="text-ink font-bold text-sm sm:text-xl lg:text-base xl:text-[15px] tracking-tight whitespace-nowrap">
              {formatPrice(product.price)}
            </span>
          </div>

          {/* Add to Cart / View Cart — single line, never wraps */}
          {isInCart ? (
            <button
              onClick={handleViewCart}
              className="justify-center whitespace-nowrap shrink-0 px-2.5 py-1.5 sm:px-6 sm:py-3 lg:px-4 lg:py-2 rounded-full text-xs sm:text-base lg:text-xs font-medium transition-all duration-150 flex items-center gap-1.5 shadow-sm bg-success text-white hover:bg-success/90 hover:shadow active:scale-95 max-[360px]:w-full"
            >
              <ShoppingCart className="w-3.5 h-3.5 sm:w-5 sm:h-5 lg:w-3.5 lg:h-3.5 shrink-0" />
              <span>View Cart</span>
            </button>
          ) : (
            <button
              onClick={handleAddToCart}
              disabled={isOutOfStock}
              className={cn(
                "justify-center whitespace-nowrap shrink-0 px-2.5 py-1.5 sm:px-6 sm:py-3 lg:px-4 lg:py-2 rounded-full text-xs sm:text-base lg:text-xs font-medium transition-all duration-150 flex items-center gap-1.5 shadow-sm max-[360px]:w-full",
                isOutOfStock
                  ? "bg-neutral-200 text-neutral-500 shadow-none cursor-not-allowed"
                  : "bg-accent text-white hover:bg-accent-dark hover:shadow active:scale-95"
              )}
            >
              <ShoppingBag className="w-3.5 h-3.5 sm:w-5 sm:h-5 lg:w-3.5 lg:h-3.5 shrink-0" />
              <span>{isOutOfStock ? "Out of Stock" : "Add to Cart"}</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
