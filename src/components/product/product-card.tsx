"use client";

import React, { useState } from "react";
import { Heart, ShoppingBag, ShoppingCart, Star, Sparkles } from "lucide-react";
import { cn, formatPrice } from "@/lib/utils";
import { useWishlistStore } from "@/store/wishlist.store";
import { useCartStore } from "@/store/cart.store";
import { useToastStore } from "@/store/toast.store";
import type { Product } from "@/types/product";

interface ProductCardProps {
  product: Product;
  onNavigate?: (product: Product) => void;
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

export function ProductCard({ product, onNavigate }: ProductCardProps) {
  const [mainImgSrc, setMainImgSrc] = useState<string>(
    product.images?.[0] ?? ""
  );
  const [hoverImgSrc, setHoverImgSrc] = useState<string>(
    product.hoverImage ??
      product.images?.[1] ??
      `https://picsum.photos/seed/${product.id}-hover/800/800`
  );
  const [hoverFailed, setHoverFailed] = useState<boolean>(false);

  const isWishlisted = useWishlistStore((s) => s.isWishlisted(product.id));
  const toggleWishlist = useWishlistStore((s) => s.toggleWishlist);
  const addItem = useCartStore((s) => s.addItem);
  const toggleCart = useCartStore((s) => s.toggleCart);
  const isInCart = useCartStore((s) =>
    s.items.some((item) => item.product.id === product.id)
  );
  const addToast = useToastStore((s) => s.addToast);

  const discount = discountPercent(product.price, product.compareAtPrice);
  const hasHoverImage = !hoverFailed && !!hoverImgSrc;
  const volumeInfo = parseVolume(product.volume);

  const handleClick = () => {
    if (onNavigate) {
      onNavigate(product);
    } else if (typeof window !== "undefined") {
      window.location.href = `/product/${product.slug}`;
    }
  };

  const handleWishlist = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleWishlist(product.id);
    addToast(
      isWishlisted
        ? "Removed from wishlist"
        : `${product.name} added to wishlist`,
      "info"
    );
  };

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    addItem(product, 1);
    addToast(`${product.name} added to cart`, "success");
  };

  const handleViewCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleCart();
  };

  /* Tag / badge label */
  const badgeLabel =
    product.tag === "best"
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
        {/* Discount Badge */}
        {discount > 0 && (
          <div className="absolute top-3 right-3 z-20 bg-accent-dark text-accent-pale font-bold text-[10px] sm:text-xs lg:text-[11px] tracking-wide px-2 sm:px-3 lg:px-2.5 py-0.5 sm:py-1 lg:py-0.5 rounded-full shadow-sm uppercase flex items-center gap-1">
            <span>{discount}% OFF</span>
          </div>
        )}

        {/* Badge tag (Best / New) — only if no discount badge */}
        {discount === 0 && badgeLabel && (
          <div className="absolute top-3 right-3 z-20 bg-accent text-white font-bold text-[10px] sm:text-xs lg:text-[11px] tracking-wide px-2 sm:px-3 lg:px-2.5 py-0.5 sm:py-1 lg:py-0.5 rounded-full shadow-sm uppercase">
            {badgeLabel}
          </div>
        )}

        {/* Wishlist Heart Button */}
        <button
          onClick={handleWishlist}
          className={cn(
            "absolute top-3 left-3 z-20 w-8 h-8 sm:w-10 sm:h-10 lg:w-8 lg:h-8 rounded-full bg-surface flex items-center justify-center transition-all duration-150 shadow-sm hover:scale-105",
            isWishlisted
              ? "text-accent fill-accent"
              : "text-ink-muted hover:text-accent"
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
            setMainImgSrc(
              `https://picsum.photos/seed/${product.id}-main/800/800`
            );
          }}
        />

        {/* Hover Image (second view) */}
        {hasHoverImage && (
          <img
            src={hoverImgSrc}
            alt={`${product.name} alternate view`}
            referrerPolicy="no-referrer"
            className="absolute inset-0 w-full h-full object-cover rounded-lg opacity-0 transition-all duration-500 ease-in-out group-hover:opacity-100 group-hover:scale-105 p-1"
            loading="lazy"
            onError={() => {
              if (!hoverImgSrc.includes("picsum.photos")) {
                setHoverImgSrc(
                  `https://picsum.photos/seed/${product.id}-hover/800/800`
                );
              } else {
                setHoverFailed(true);
              }
            }}
          />
        )}

        {/* Fallback */}
        <div className="hidden group-has-[img[style*='display: none']]:flex flex-col items-center justify-center text-ink-muted">
          <Sparkles className="w-10 h-10 mb-1" />
          <span className="text-xs text-ink-muted font-medium">
            {product.brand}
          </span>
        </div>
      </div>

      {/* ── Content ── */}
      <div className="p-3 sm:p-5 lg:p-3.5 xl:p-4 flex-1 flex flex-col justify-between">
        <div>
          {/* Brand • Category */}
          <div className="text-[11px] sm:text-xs lg:text-[10px] font-bold text-accent tracking-wider uppercase mb-1.5 sm:mb-2 lg:mb-1.5 text-left">
            {product.brand}{" "}
            <span className="text-accent-light">•</span>{" "}
            {product.category === "sun-care"
              ? "Sun Care"
              : product.category.charAt(0).toUpperCase() +
                product.category.slice(1)}
          </div>

          {/* Product Name */}
          <h3 className="font-semibold text-ink text-[15px] sm:text-[17px] lg:text-base xl:text-base leading-snug line-clamp-2 min-h-[2.25rem] sm:min-h-[2.5rem] lg:min-h-[2.25rem] group-hover:text-accent-dark transition-colors font-sans">
            {product.name}
          </h3>

          {/* In Stock + Volume */}
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

          {/* Star Rating */}
          <div className="mt-1.5 sm:mt-2 lg:mt-1.5 flex items-center gap-1 text-xs sm:text-sm lg:text-xs">
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
        </div>

        {/* ── Footer: Price + Add to Cart ── */}
        <div className="mt-3 sm:mt-5 lg:mt-4 pt-3 sm:pt-4 lg:pt-3.5 border-t border-border-light flex flex-row items-center justify-between gap-2 max-[360px]:flex-col max-[360px]:items-stretch max-[360px]:gap-2.5">
          {/* Price — always left-aligned, both prices side-by-side */}
          <div className="flex items-baseline gap-1.5 flex-wrap justify-start min-w-0">
            {product.compareAtPrice &&
              product.compareAtPrice > product.price && (
                <span className="text-ink-muted text-xs sm:text-base lg:text-xs line-through font-normal whitespace-nowrap">
                  {formatPrice(product.compareAtPrice)}
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
              className="justify-center whitespace-nowrap shrink-0 px-2.5 py-1.5 sm:px-6 sm:py-3 lg:px-4 lg:py-2 rounded-full text-xs sm:text-base lg:text-xs font-medium transition-all duration-150 flex items-center gap-1.5 shadow-sm bg-accent text-white hover:bg-accent-dark hover:shadow active:scale-95 max-[360px]:w-full"
            >
              <ShoppingBag className="w-3.5 h-3.5 sm:w-5 sm:h-5 lg:w-3.5 lg:h-3.5 shrink-0" />
              <span>Add to Cart</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
