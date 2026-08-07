"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Star, Minus, Plus, ShoppingBag, Heart, Truck, Shield, RotateCcw, ChevronRight } from "lucide-react";
import { useProduct } from "@/hooks/use-products";
import { useCartStore } from "@/store/cart.store";
import { Skeleton } from "@/components/ui/skeleton";

export default function ProductPage() {
  const { slug } = useParams<{ slug: string }>();
  const { data: product, isLoading } = useProduct(slug);
  const { addItem } = useCartStore();
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);

  if (isLoading) {
    return (
      <div className="mx-auto max-w-[1400px] px-6 py-8">
        <div className="grid gap-8 md:grid-cols-2">
          <Skeleton className="aspect-square w-full rounded-2xl bg-ink/[0.04]" />
          <div className="space-y-4">
            <Skeleton className="h-8 w-3/4 bg-ink/[0.04]" />
            <Skeleton className="h-6 w-1/3 bg-ink/[0.04]" />
            <Skeleton className="h-24 w-full bg-ink/[0.04]" />
            <Skeleton className="h-12 w-full bg-ink/[0.04]" />
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="mx-auto max-w-[1400px] px-6 py-20 text-center">
        <h1 className="text-2xl font-serif text-ink">Product Not Found</h1>
        <p className="mt-2 text-ink/50">
          The product you&apos;re looking for doesn&apos;t exist.
        </p>
        <Link href="/shop" className="mt-4 inline-block text-sm font-medium text-accent hover:underline">
          Back to Shop
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[1400px] px-6 py-8">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-ink/50 mb-8">
        <Link href="/" className="hover:text-ink transition-colors">Home</Link>
        <ChevronRight className="h-3 w-3" />
        <Link href="/shop" className="hover:text-ink transition-colors">Shop</Link>
        <ChevronRight className="h-3 w-3" />
        <span className="text-ink">{product.name}</span>
      </nav>

      <div className="grid gap-8 md:grid-cols-2">
        {/* Gallery */}
        <div className="flex flex-col gap-4">
          <div className="relative aspect-square overflow-hidden rounded-2xl bg-ink/[0.03]">
            <Image
              src={product.images[selectedImage]}
              alt={product.name}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 50vw"
              priority
            />
            {product.isNew && (
              <span className="absolute top-4 left-4 px-3 py-1 bg-ink text-white text-xs font-bold uppercase tracking-wider rounded-full">
                New
              </span>
            )}
            {product.tag === "best" && (
              <span className="absolute top-4 left-4 px-3 py-1 bg-accent text-white text-xs font-bold uppercase tracking-wider rounded-full">
                Best Seller
              </span>
            )}
          </div>

          {product.images.length > 1 && (
            <div className="flex gap-3 overflow-x-auto">
              {product.images.map((image, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedImage(index)}
                  className={`relative aspect-square w-20 flex-shrink-0 overflow-hidden rounded-xl border-2 transition-all ${
                    selectedImage === index
                      ? "border-ink"
                      : "border-transparent hover:border-ink/20"
                  }`}
                >
                  <Image
                    src={image}
                    alt={`${product.name} thumbnail ${index + 1}`}
                    fill
                    className="object-cover"
                    sizes="80px"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Details */}
        <div className="flex flex-col gap-5">
          {/* Brand */}
          {product.brand && (
            <p className="text-xs font-bold uppercase tracking-widest text-ink/40">
              {product.brand}
            </p>
          )}

          {/* Name */}
          <h1 className="text-3xl font-serif font-medium text-ink leading-tight">
            {product.name}
          </h1>

          {/* Rating */}
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-0.5">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  className={`h-4 w-4 ${
                    i < Math.floor(product.rating)
                      ? "fill-amber-400 text-amber-400"
                      : "text-ink/15"
                  }`}
                />
              ))}
            </div>
            <span className="text-sm font-medium text-ink">{product.rating}</span>
            <span className="text-sm text-ink/40">({product.reviewCount} reviews)</span>
          </div>

          {/* Price */}
          <div className="flex items-baseline gap-3">
            <span className="text-3xl font-bold text-ink">
              ৳{product.price.toLocaleString()}
            </span>
            {product.krw && (
              <span className="text-sm text-ink/40">{product.krw}</span>
            )}
          </div>

          {/* Description */}
          <p className="text-ink/60 leading-relaxed font-light">
            {product.longDescription || product.description}
          </p>

          {/* Meta */}
          <div className="grid grid-cols-2 gap-4 py-4 border-y border-ink/10">
            {product.volume && (
              <div>
                <p className="text-xs text-ink/40 mb-1">Size</p>
                <p className="text-sm font-medium text-ink">{product.volume}</p>
              </div>
            )}
            {product.skinType && (
              <div>
                <p className="text-xs text-ink/40 mb-1">Skin Type</p>
                <p className="text-sm font-medium text-ink">{product.skinType}</p>
              </div>
            )}
            {product.source && (
              <div>
                <p className="text-xs text-ink/40 mb-1">Source</p>
                <p className="text-sm font-medium text-ink">{product.source}</p>
              </div>
            )}
            {product.concerns && product.concerns.length > 0 && (
              <div>
                <p className="text-xs text-ink/40 mb-1">Concerns</p>
                <div className="flex flex-wrap gap-1">
                  {product.concerns.map((c) => (
                    <span key={c} className="px-2 py-0.5 bg-ink/[0.04] rounded text-xs text-ink/60">
                      {c}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Quantity + Add to Cart */}
          <div className="flex items-center gap-3">
            <div className="flex items-center rounded-full border border-ink/15">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="w-10 h-10 flex items-center justify-center text-ink/60 hover:text-ink transition-colors"
              >
                <Minus className="h-4 w-4" />
              </button>
              <span className="w-10 text-center text-sm font-medium">{quantity}</span>
              <button
                onClick={() => setQuantity(quantity + 1)}
                className="w-10 h-10 flex items-center justify-center text-ink/60 hover:text-ink transition-colors"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>

            <button
              onClick={() => {
                addItem(product, quantity);
                setQuantity(1);
              }}
              className="flex-1 flex items-center justify-center gap-2 h-12 bg-ink text-white rounded-full font-semibold text-sm hover:bg-accent transition-colors"
            >
              <ShoppingBag className="h-5 w-5" />
              Add to Cart
            </button>

            <button className="w-12 h-12 flex items-center justify-center rounded-full border border-ink/15 text-ink/60 hover:text-ink hover:border-ink/30 transition-all">
              <Heart className="h-5 w-5" />
            </button>
          </div>

          {/* Stock */}
          {product.stock <= 5 && product.stock > 0 && (
            <p className="text-sm text-amber-600 font-medium">
              Only {product.stock} left in stock — order soon!
            </p>
          )}
          {product.stock === 0 && (
            <p className="text-sm text-red-500 font-medium">Out of stock</p>
          )}

          {/* Trust badges */}
          <div className="space-y-3 pt-4">
            <div className="flex items-center gap-3 text-sm text-ink/60">
              <Truck className="h-4 w-4 text-ink/40" />
              Free delivery on orders over ৳2,000 in Dhaka
            </div>
            <div className="flex items-center gap-3 text-sm text-ink/60">
              <Shield className="h-4 w-4 text-ink/40" />
              100% Authentic — Batch Verified
            </div>
            <div className="flex items-center gap-3 text-sm text-ink/60">
              <RotateCcw className="h-4 w-4 text-ink/40" />
              Easy returns within 7 days
            </div>
          </div>
        </div>
      </div>

      {/* Product Details */}
      <div className="mt-16 pt-12 border-t border-ink/10">
        <div className="grid gap-8 md:grid-cols-2">
          {product.ingredients && (
            <div>
              <h3 className="text-lg font-serif font-medium text-ink mb-3">
                Key Ingredients
              </h3>
              <p className="text-sm text-ink/60 leading-relaxed">
                {product.ingredients}
              </p>
            </div>
          )}
          {product.howToUse && (
            <div>
              <h3 className="text-lg font-serif font-medium text-ink mb-3">
                How to Use
              </h3>
              <p className="text-sm text-ink/60 leading-relaxed">
                {product.howToUse}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Related Products */}
      <div className="mt-16 pt-12 border-t border-ink/10">
        <h2 className="text-2xl font-serif font-medium text-ink mb-8">
          You May Also Like
        </h2>
        <div className="grid grid-cols-2 gap-6 lg:grid-cols-4">
          {isLoading
            ? Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="space-y-3">
                  <Skeleton className="aspect-[3/4] w-full rounded-2xl bg-ink/[0.04]" />
                  <Skeleton className="h-4 w-3/4 bg-ink/[0.04]" />
                  <Skeleton className="h-4 w-1/2 bg-ink/[0.04]" />
                </div>
              ))
            : null}
        </div>
      </div>
    </div>
  );
}
