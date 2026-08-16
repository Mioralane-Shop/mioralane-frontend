"use client";

import Link from "next/link";
import { Minus, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ProductImage } from "@/components/common/product-image";
import { useCartStore } from "@/store/cart.store";
import { formatPrice } from "@/lib/utils";
import type { CartItem as CartItemType } from "@/types/product";

interface CartItemProps {
  item: CartItemType;
}

export function CartItemRow({ item }: CartItemProps) {
  const { updateQuantity, removeItem } = useCartStore();
  const { product, quantity } = item;
  const canIncrease = product.stock > 0 && quantity < product.stock;
  const isOutOfStock = product.stock <= 0;

  return (
    <div className="flex gap-4 py-4">
      <Link
        href={`/product/${product.slug}`}
        className="relative h-24 w-24 flex-shrink-0 overflow-hidden rounded-xl bg-rose-50"
      >
        <ProductImage
          src={product.images[0]}
          alt={product.name}
          fallbackId={product.id}
          fill
          className="object-cover"
          sizes="96px"
        />
      </Link>

      <div className="flex flex-1 flex-col justify-between">
        <div>
          <Link href={`/product/${product.slug}`}>
            <h4 className="text-sm font-medium text-neutral-800 hover:text-rose-500 transition-colors line-clamp-1">
              {product.name}
            </h4>
          </Link>
          <p className="mt-0.5 text-sm font-semibold text-rose-600">
            {formatPrice(product.price)}
          </p>
          {isOutOfStock && (
            <p className="mt-1 text-xs font-medium text-red-500">
              Out of stock
            </p>
          )}
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="icon"
              className="h-7 w-7 rounded-lg"
              onClick={() => updateQuantity(product.id, quantity - 1)}
            >
              <Minus className="h-3 w-3" />
            </Button>
            <span className="w-8 text-center text-sm font-medium">
              {quantity}
            </span>
            <Button
              variant="outline"
              size="icon"
              className="h-7 w-7 rounded-lg"
              onClick={() => updateQuantity(product.id, quantity + 1)}
              disabled={!canIncrease}
            >
              <Plus className="h-3 w-3" />
            </Button>
          </div>

          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 text-neutral-400 hover:text-red-500"
            onClick={() => removeItem(product.id)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
