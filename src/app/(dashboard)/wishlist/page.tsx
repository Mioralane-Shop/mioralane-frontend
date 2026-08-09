"use client";

import Link from "next/link";
import { Heart } from "lucide-react";
import { ProductCard } from "@/components/product/product-card";
import { useWishlistStore } from "@/store/wishlist.store";
import { useProducts } from "@/hooks/use-products";
import { DUMMY_PRODUCTS } from "@/constants/site";
import type { Product } from "@/types/product";

export default function WishlistPage() {
  const { productIds } = useWishlistStore();
  const { data: apiProducts } = useProducts();

  const allProducts = (apiProducts || DUMMY_PRODUCTS) as Product[];
  const wishlistProducts = allProducts.filter((p) => productIds.includes(p.id));

  return (
    <div className="mx-auto max-w-[1400px] px-4 sm:px-6 py-8">
      <div className="mb-8 flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-full bg-rose-50">
          <Heart className="h-5 w-5 fill-rose-500 text-rose-500" />
        </div>
        <div>
          <h1 className="text-2xl font-serif font-medium text-ink">
            My Wishlist
          </h1>
          <p className="text-sm text-ink/50">
            {wishlistProducts.length}{" "}
            {wishlistProducts.length === 1 ? "item" : "items"} saved
          </p>
        </div>
      </div>

      {wishlistProducts.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-border-light bg-surface py-20 text-center">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-rose-50">
            <Heart className="h-7 w-7 text-rose-300" />
          </div>
          <h2 className="text-lg font-semibold text-ink">
            Your wishlist is empty
          </h2>
          <p className="mt-1 mb-6 max-w-sm text-sm text-ink/50">
            Tap the heart on any product to save it here for later.
          </p>
          <Link
            href="/shop"
            className="rounded-full bg-accent px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-accent-dark no-underline"
          >
            Browse Products
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-2 sm:gap-5 lg:grid-cols-3 xl:grid-cols-4">
          {wishlistProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}
