"use client";

import Link from "next/link";
import { Minus, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ProductImage } from "@/components/common/product-image";
import { useCartStore } from "@/store/cart.store";
import { cn, formatPrice } from "@/lib/utils";
import type { CartItem as CartItemType } from "@/types/product";

interface CartItemProps {
  item: CartItemType;
}

export function CartItemRow({ item }: CartItemProps) {
  const { updateQuantity, removeItem, isSyncingCatalog } = useCartStore();
  const { product, quantity, catalogStatus, itemId, itemType: storedItemType } = item;
  const itemType = storedItemType ?? product.itemType ?? (product.category === "combo" ? "combo" : "product");
  const catalogItemId = itemId || product.id;
  const itemHref = itemType === "combo" ? `/combo/${product.slug}` : `/product/${product.slug}`;
  const isVerified = catalogStatus === "verified";
  const isUnavailable = catalogStatus === "missing" || catalogStatus === "error";
  const isOutOfStock = isVerified && product.stock <= 0;
  const canIncrease = isVerified && product.stock > 0 && quantity < product.stock;
  const statusLabel = isUnavailable
    ? catalogStatus === "missing"
      ? "No longer available"
      : "Availability could not be verified"
    : isOutOfStock
      ? "Out of stock"
      : null;
  const showPrice = isVerified || isOutOfStock;
  const canNavigate = !isUnavailable;

  return (
    <div className="flex gap-4 py-4">
      {canNavigate ? (
        <Link
          href={itemHref}
          className="relative h-24 w-24 flex-shrink-0 overflow-hidden rounded-xl bg-brand-50"
        >
          <ProductImage
            src={product.images[0]}
            alt={product.name}
            fallbackId={product.id}
            fill
            className="object-cover"
            sizes="96px"
            deliveryPreset="thumbnail"
          />
        </Link>
      ) : (
        <div className="relative h-24 w-24 flex-shrink-0 overflow-hidden rounded-xl bg-brand-50">
          <ProductImage
            src={product.images[0]}
            alt={product.name}
            fallbackId={product.id}
            fill
            className="object-cover"
            sizes="96px"
            deliveryPreset="thumbnail"
          />
        </div>
      )}

      <div className="flex flex-1 flex-col justify-between">
        <div>
          {canNavigate ? (
            <Link href={itemHref}>
              <h4 className="text-sm font-medium text-neutral-800 transition-colors line-clamp-1 hover:text-brand-500">
                {product.name}
              </h4>
            </Link>
          ) : (
            <h4 className="text-sm font-medium text-neutral-800 line-clamp-1">
              {product.name}
            </h4>
          )}
          <p className="mt-0.5 text-sm font-semibold text-brand-600">
            {showPrice ? formatPrice(product.price) : "Price unavailable"}
          </p>
          {statusLabel && (
            <p
              className={cn(
                "mt-1 text-xs font-medium",
                isUnavailable ? "text-amber-600" : "text-red-500",
              )}
            >
              {statusLabel}
            </p>
          )}
          {isSyncingCatalog && !catalogStatus && (
            <p className="mt-1 text-xs font-medium text-neutral-400">
              Refreshing availability
            </p>
          )}
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="icon"
              className="h-7 w-7 rounded-lg"
              onClick={() => updateQuantity(catalogItemId, quantity - 1, itemType)}
              disabled={quantity === 1}
            >
              <Minus className="h-3 w-3" />
            </Button>
            <span className="w-8 text-center text-sm font-medium">
              {quantity}
            </span>
            <Button
              variant="outline"
              size="icon"
              className={cn(
                "h-7 w-7 rounded-lg",
                "disabled:cursor-not-allowed disabled:text-neutral-300",
              )}
              onClick={() => updateQuantity(catalogItemId, quantity + 1, itemType)}
              disabled={!canIncrease}
            >
              <Plus className="h-3 w-3" />
            </Button>
          </div>

          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 text-neutral-400 hover:text-red-500"
            onClick={() => removeItem(catalogItemId, itemType)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
