"use client";

import Link from "next/link";
import { Minus, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ProductImage } from "@/components/common/product-image";
import { useCartStore } from "@/store/cart.store";
import { cn, formatPrice } from "@/lib/utils";
import { formatPreOrderDate, getPurchasableQuantityLimit, isPreOrderProduct, isPurchasableProduct } from "@/lib/pre-order";
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
  const isPreOrder = isPreOrderProduct(product);
  const quantityLimit = getPurchasableQuantityLimit(product);
  const isOutOfStock = isVerified && !isPurchasableProduct(product);
  const canIncrease = isVerified && isPurchasableProduct(product) && quantity < quantityLimit;
  const statusLabel = isUnavailable
    ? catalogStatus === "missing"
      ? "No longer available"
      : "Availability could not be verified"
      : isOutOfStock
        ? isPreOrder
          ? product.preOrder?.status === "accepting"
            ? "Pre-order full"
            : "Pre-order closed"
          : "Out of stock"
      : null;
  const showPrice = isVerified || isOutOfStock;
  const canNavigate = !isUnavailable;

  return (
    <div className="flex min-w-0 gap-3 py-4 sm:gap-4">
      {canNavigate ? (
        <Link
          href={itemHref}
          className="relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-xl bg-brand-50 sm:h-24 sm:w-24"
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
        <div className="relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-xl bg-brand-50 sm:h-24 sm:w-24">
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

      <div className="flex min-w-0 flex-1 flex-col justify-between">
        <div>
          {canNavigate ? (
            <Link href={itemHref}>
              <h4 className="line-clamp-2 text-sm font-medium text-neutral-800 transition-colors hover:text-brand-500">
                {product.name}
              </h4>
            </Link>
          ) : (
            <h4 className="line-clamp-2 text-sm font-medium text-neutral-800">
              {product.name}
            </h4>
          )}
          <p className="mt-0.5 text-sm font-semibold text-brand-600">
            {showPrice ? formatPrice(product.price) : "Price unavailable"}
          </p>
          {isPreOrder ? (
            <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-neutral-500">
              <span className="font-semibold uppercase tracking-wide text-brand-600">PRE-ORDER</span>
              {product.preOrder?.expectedArrivalDate ? (
                <span>Expected arrival: {formatPreOrderDate(product.preOrder.expectedArrivalDate)}</span>
              ) : null}
            </div>
          ) : null}
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

        <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
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
