"use client";

import Link from "next/link";
import { useState } from "react";
import { Loader2, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ProductImage } from "@/components/common/product-image";
import { useCartRecommendations } from "@/hooks/use-products";
import { getProductAvailability } from "@/lib/pre-order";
import { formatPrice } from "@/lib/utils";
import { useCartStore } from "@/store/cart.store";
import { useToastStore } from "@/store/toast.store";
import type { CartItem, Product } from "@/types/product";

function getProductCartIds(items: CartItem[]) {
  return items
    .filter((item) => (item.itemType ?? item.product.itemType ?? "product") === "product")
    .map((item) => item.itemId || item.product.id)
    .filter(Boolean);
}

function RecommendationRow({ product }: { product: Product }) {
  const addItem = useCartStore((state) => state.addItem);
  const isInCart = useCartStore((state) =>
    state.items.some(
      (item) =>
        (item.itemType ?? item.product.itemType ?? "product") === "product" &&
        (item.itemId || item.product.id) === product.id,
    ),
  );
  const addToast = useToastStore((state) => state.addToast);
  const [isAdding, setIsAdding] = useState(false);
  const availability = getProductAvailability(product);

  function handleAddToCart() {
    if (isAdding || isInCart || !availability.isAvailable) return;
    setIsAdding(true);
    addItem({ ...product, itemType: "product" }, 1);
    addToast(`${product.name} added to cart`, "success");
    window.setTimeout(() => setIsAdding(false), 300);
  }

  return (
    <div className="flex min-w-0 items-center gap-3 py-3">
      <Link
        href={`/product/${product.slug}`}
        className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-brand-50"
      >
        <ProductImage
          src={product.images?.[0]}
          alt={product.name}
          fallbackId={product.id}
          fill
          className="object-cover"
          sizes="64px"
          deliveryPreset="thumbnail"
        />
      </Link>

      <div className="min-w-0 flex-1">
        <Link href={`/product/${product.slug}`}>
          <h4 className="line-clamp-2 text-sm font-medium text-neutral-800 transition-colors hover:text-brand-500">
            {product.name}
          </h4>
        </Link>
        <p className="mt-1 text-sm font-semibold text-brand-600">
          {formatPrice(product.price)}
        </p>
      </div>

      <Button
        type="button"
        size="sm"
        className="shrink-0"
        onClick={handleAddToCart}
        disabled={isAdding || isInCart || !availability.isAvailable}
      >
        {isAdding ? <Loader2 className="h-4 w-4 animate-spin" /> : <ShoppingBag className="h-4 w-4" />}
        {isAdding ? "Adding" : isInCart ? "Added" : availability.ctaLabel}
      </Button>
    </div>
  );
}

export function CrossSellRecommendations({ className = "" }: { className?: string }) {
  const items = useCartStore((state) => state.items);
  const productIds = getProductCartIds(items);
  const { data, isLoading, isError, error } = useCartRecommendations(productIds);

  if (items.length === 0 || productIds.length === 0) {
    return null;
  }

  if (isLoading) {
    return (
      <section className={className}>
        <div className="flex items-center gap-2 rounded-2xl border border-brand-100 bg-white px-4 py-3 text-sm text-neutral-500">
          <Loader2 className="h-4 w-4 animate-spin" />
          Loading recommendations...
        </div>
      </section>
    );
  }

  if (isError) {
    return (
      <section className={className}>
        <div className="rounded-2xl border border-brand-100 bg-brand-50/60 px-4 py-3 text-sm text-neutral-600">
          <p className="font-medium text-neutral-800">Unable to load recommendations</p>
          <p className="mt-1 text-xs text-neutral-500">
            {error.message || "Please try again shortly."}
          </p>
        </div>
      </section>
    );
  }

  const recommendations = data ?? [];
  if (recommendations.length === 0) {
    return null;
  }

  return (
    <section className={className}>
      <div className="rounded-2xl border border-brand-100 bg-white px-4 py-4">
        <h3 className="text-sm font-semibold text-neutral-800">Pairs Well With</h3>
        <div className="mt-1 divide-y divide-brand-50">
          {recommendations.map((product) => (
            <RecommendationRow key={product.id} product={product} />
          ))}
        </div>
      </div>
    </section>
  );
}
