"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { Star, Minus, Plus, ShoppingBag, Heart, Truck, Shield, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ProductGallery } from "@/components/product/product-gallery";
import { RelatedProducts } from "@/components/product/related-products";
import { useProduct } from "@/hooks/use-products";
import { useCartStore } from "@/store/cart.store";
import { formatPrice } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";

export default function ProductPage() {
  const { slug } = useParams<{ slug: string }>();
  const { data: product, isLoading } = useProduct(slug);
  const { addItem } = useCartStore();
  const [quantity, setQuantity] = useState(1);

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="grid gap-8 md:grid-cols-2">
          <Skeleton className="aspect-square w-full rounded-2xl" />
          <div className="space-y-4">
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-6 w-1/3" />
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <h1 className="text-2xl font-light text-neutral-800">Product Not Found</h1>
        <p className="mt-2 text-neutral-400">
          The product you&apos;re looking for doesn&apos;t exist.
        </p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid gap-8 md:grid-cols-2">
        <ProductGallery images={product.images} name={product.name} />

        <div className="flex flex-col gap-6">
          <div>
            <div className="flex flex-wrap gap-2 mb-2">
              {product.isNew && <Badge variant="secondary">New</Badge>}
              {product.isBestSeller && <Badge>Best Seller</Badge>}
              {product.compareAtPrice && (
                <Badge variant="outline" className="bg-white border-red-200 text-red-600">
                  Sale
                </Badge>
              )}
            </div>
            <h1 className="text-3xl font-light tracking-tight text-neutral-800">
              {product.name}
            </h1>
            <div className="mt-2 flex items-center gap-2">
              <div className="flex items-center gap-0.5">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={`h-4 w-4 ${
                      i < Math.floor(product.rating)
                        ? "fill-amber-400 text-amber-400"
                        : "text-neutral-200"
                    }`}
                  />
                ))}
              </div>
              <span className="text-sm font-medium text-neutral-600">
                {product.rating}
              </span>
              <span className="text-sm text-neutral-400">
                ({product.reviewCount} reviews)
              </span>
            </div>
          </div>

          <div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-semibold text-rose-600">
                {formatPrice(product.price)}
              </span>
              {product.compareAtPrice && (
                <span className="text-lg text-neutral-400 line-through">
                  {formatPrice(product.compareAtPrice)}
                </span>
              )}
            </div>
            {product.compareAtPrice && (
              <p className="mt-1 text-sm text-red-500 font-medium">
                You save {formatPrice(product.compareAtPrice - product.price)}
              </p>
            )}
          </div>

          <p className="text-neutral-600 leading-relaxed">
            {product.longDescription || product.description}
          </p>

          {product.volume && (
            <p className="text-sm text-neutral-500">
              Size: <span className="font-medium">{product.volume}</span>
            </p>
          )}

          {product.skinType && (
            <p className="text-sm text-neutral-500">
              Skin Type:{" "}
              <span className="font-medium">{product.skinType}</span>
            </p>
          )}

          <div className="flex items-center gap-3">
            <div className="flex items-center rounded-full border border-rose-200">
              <Button
                variant="ghost"
                size="icon"
                className="h-10 w-10 rounded-full"
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
              >
                <Minus className="h-4 w-4" />
              </Button>
              <span className="w-10 text-center text-sm font-medium">
                {quantity}
              </span>
              <Button
                variant="ghost"
                size="icon"
                className="h-10 w-10 rounded-full"
                onClick={() => setQuantity(quantity + 1)}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>

            <Button
              size="lg"
              className="flex-1"
              onClick={() => {
                addItem(product, quantity);
                setQuantity(1);
              }}
            >
              <ShoppingBag className="mr-2 h-5 w-5" />
              Add to Cart
            </Button>

            <Button variant="outline" size="icon" className="h-12 w-12 shrink-0">
              <Heart className="h-5 w-5" />
            </Button>
          </div>

          {product.stock <= 5 && product.stock > 0 && (
            <p className="text-sm text-amber-600 font-medium">
              Only {product.stock} left in stock — order soon!
            </p>
          )}
          {product.stock === 0 && (
            <p className="text-sm text-red-500 font-medium">Out of stock</p>
          )}

          <div className="border-t border-rose-100 pt-6 space-y-3">
            <div className="flex items-center gap-3 text-sm text-neutral-600">
              <Truck className="h-4 w-4 text-rose-400" />
              Free shipping on orders over $50
            </div>
            <div className="flex items-center gap-3 text-sm text-neutral-600">
              <Shield className="h-4 w-4 text-rose-400" />
              Secure checkout with SSL encryption
            </div>
            <div className="flex items-center gap-3 text-sm text-neutral-600">
              <RotateCcw className="h-4 w-4 text-rose-400" />
              30-day money-back guarantee
            </div>
          </div>
        </div>
      </div>

      {/* Product Details Tabs */}
      <div className="mt-16 border-t border-rose-100 pt-12">
        <div className="grid gap-8 md:grid-cols-2">
          {product.ingredients && (
            <div>
              <h3 className="text-lg font-medium text-neutral-800 mb-3">
                Key Ingredients
              </h3>
              <p className="text-sm text-neutral-600 leading-relaxed">
                {product.ingredients}
              </p>
            </div>
          )}
          {product.howToUse && (
            <div>
              <h3 className="text-lg font-medium text-neutral-800 mb-3">
                How to Use
              </h3>
              <p className="text-sm text-neutral-600 leading-relaxed">
                {product.howToUse}
              </p>
            </div>
          )}
        </div>
      </div>

      <RelatedProducts category={product.category} excludeId={product.id} />
    </div>
  );
}
