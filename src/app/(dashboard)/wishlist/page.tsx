"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Heart, Loader2, ShoppingBag, Trash2 } from "lucide-react";
import { RequireAuth } from "@/components/common/require-auth";
import { ProductImage } from "@/components/common/product-image";
import { useWishlistStore } from "@/store/wishlist.store";
import { useCartStore } from "@/store/cart.store";
import { useToastStore } from "@/store/toast.store";
import { cn, formatPrice } from "@/lib/utils";
import type { Product } from "@/types/product";

function getWishlistItemType(product: Product) {
  return product.itemType ?? (product.category === "combo" ? "combo" : "product");
}

function getWishlistItemHref(product: Product) {
  return getWishlistItemType(product) === "combo"
    ? `/combo/${product.slug}`
    : `/product/${product.slug}`;
}

function WishlistProductCard({ product }: { product: Product }) {
  const addItem = useCartStore((s) => s.addItem);
  const toggleCart = useCartStore((s) => s.toggleCart);
  const removeFromWishlist = useWishlistStore((s) => s.toggleWishlist);
  const isRemoving = useWishlistStore((s) => s.isToggling === product.id);
  const addToast = useToastStore((s) => s.addToast);
  const isOutOfStock = product.stock <= 0;
  const itemType = getWishlistItemType(product);
  const itemHref = getWishlistItemHref(product);

  const handleAddToCart = () => {
    addItem(
      {
        ...product,
        itemType,
      },
      1
    );
    addToast(`${product.name} added to cart`, "success");
    toggleCart();
  };

  const handleRemove = async () => {
    try {
      await removeFromWishlist(
        product.id,
        itemType
      );
      addToast("Removed from wishlist", "info");
    } catch {
      addToast("Could not remove item. Please try again.", "error");
    }
  };

  return (
    <article className="group overflow-hidden rounded-2xl border border-border-light bg-white shadow-sm transition-shadow hover:shadow-md">
      <Link
        href={itemHref}
        className="relative block aspect-square overflow-hidden bg-ink/[0.03]"
      >
        <ProductImage
          src={product.images?.[0] || "/images/logo-m.svg"}
          alt={product.name}
          fallbackId={product.id}
          fill
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          className="object-cover transition-transform duration-300 group-hover:scale-[1.03]"
        />
        <span className="absolute left-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-white/90 text-rose-500 shadow-sm">
          <Heart className="h-4 w-4 fill-current" />
        </span>
      </Link>

      <div className="p-4">
        <p className="text-[11px] font-bold uppercase tracking-wider text-accent">
          {product.brand}
        </p>
        <Link
          href={itemHref}
          className="mt-1 line-clamp-2 min-h-[2.5rem] text-sm font-semibold leading-snug text-ink transition-colors hover:text-accent"
        >
          {product.name}
        </Link>

        <div className="mt-3 flex items-baseline gap-2">
          <span className="text-base font-bold text-ink">
            {formatPrice(product.price)}
          </span>
          {product.compareAtPrice && product.compareAtPrice > product.price ? (
            <span className="text-xs text-ink/40 line-through">
              {formatPrice(product.compareAtPrice)}
            </span>
          ) : null}
        </div>

        <div className="mt-4 grid grid-cols-[1fr_auto] gap-2">
          <button
            onClick={handleAddToCart}
            disabled={isOutOfStock}
            className={cn(
              "inline-flex h-10 items-center justify-center gap-2 rounded-full px-3 text-sm font-semibold transition-colors",
              isOutOfStock
                ? "cursor-not-allowed bg-neutral-100 text-neutral-400"
                : "bg-accent text-white hover:bg-accent-dark"
            )}
          >
            <ShoppingBag className="h-4 w-4" />
            {isOutOfStock ? "Out of Stock" : "Add to Cart"}
          </button>
          <button
            onClick={handleRemove}
            disabled={isRemoving}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-ink/10 text-ink/50 transition-colors hover:border-rose-200 hover:bg-rose-50 hover:text-rose-500 disabled:cursor-wait disabled:opacity-60"
            aria-label={`Remove ${product.name} from wishlist`}
          >
            {isRemoving ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Trash2 className="h-4 w-4" />
            )}
          </button>
        </div>
      </div>
    </article>
  );
}

export default function WishlistPage() {
  const { products, isLoading, error, fetchWishlist } = useWishlistStore();

  useEffect(() => {
    fetchWishlist().catch(() => {
      // The page keeps the existing state and shows an empty/error-safe surface.
    });
  }, [fetchWishlist]);

  return (
    <RequireAuth>
      <div className="mx-auto max-w-[1400px] px-4 py-8 sm:px-6">
        <div className="mb-8 flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-full bg-rose-50">
            <Heart className="h-5 w-5 fill-rose-500 text-rose-500" />
          </div>
          <div>
            <h1 className="font-serif text-2xl font-medium text-ink">
              My Wishlist
            </h1>
            <p className="text-sm text-ink/50">
              {products.length} {products.length === 1 ? "item" : "items"} saved
            </p>
          </div>
        </div>

        {isLoading ? (
          <div className="flex min-h-[320px] items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-accent" />
          </div>
        ) : error ? (
          <div className="flex min-h-[360px] flex-col items-center justify-center rounded-2xl border border-border-light bg-white px-6 py-16 text-center">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-rose-50">
              <Heart className="h-7 w-7 text-rose-300" />
            </div>
            <h2 className="text-lg font-semibold text-ink">
              Could not load your wishlist
            </h2>
            <p className="mb-6 mt-1 max-w-sm text-sm text-ink/50">
              We ran into a problem loading your saved items. Please try again.
            </p>
            <button
              type="button"
              onClick={() => fetchWishlist()}
              className="rounded-full bg-accent px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-accent-dark no-underline"
            >
              Retry
            </button>
          </div>
        ) : products.length === 0 ? (
          <div className="flex min-h-[360px] flex-col items-center justify-center rounded-2xl border border-border-light bg-white px-6 py-16 text-center">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-rose-50">
              <Heart className="h-7 w-7 text-rose-300" />
            </div>
            <h2 className="text-lg font-semibold text-ink">
              Your wishlist is empty
            </h2>
            <p className="mb-6 mt-1 max-w-sm text-sm text-ink/50">
              Save your favorite K-beauty picks and come back when you are ready.
            </p>
            <Link
              href="/shop"
              className="rounded-full bg-accent px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-accent-dark no-underline"
            >
              Explore Products
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-3 xl:grid-cols-4">
            {products.map((product) => (
              <WishlistProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </RequireAuth>
  );
}
