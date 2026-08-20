"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useParams } from "next/navigation";
import { useState } from "react";
import { CheckCircle2, Heart, Minus, Package, Plus, Star } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ProductImage } from "@/components/common/product-image";
import { useCombo } from "@/hooks/use-combos";
import { useCartStore } from "@/store/cart.store";
import { useAuthStore } from "@/store/auth.store";
import { useWishlistStore } from "@/store/wishlist.store";
import { useToastStore } from "@/store/toast.store";
import { cn, formatPrice } from "@/lib/utils";
import type { ComboProduct } from "@/services/combo.service";

function clampQuantity(quantity: number, stock: number) {
  if (stock <= 0) return 1;
  return Math.max(1, Math.min(quantity, stock));
}

function formatLabel(value?: string) {
  if (!value) return "";
  return value
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function getErrorStatus(error: unknown) {
  return (error as { response?: { status?: number } } | undefined)?.response?.status;
}

type ComboDisplay = ComboProduct & { itemType: "combo" };

export default function ComboDetailPage() {
  const params = useParams<{ slug: string }>();
  const slug = typeof params.slug === "string" ? params.slug : params.slug?.[0] ?? "";

  return <ComboDetailContent slug={slug} />;
}

function ComboDetailContent({ slug }: { slug: string }) {
  const router = useRouter();
  const addToast = useToastStore((state) => state.addToast);
  const addItem = useCartStore((state) => state.addItem);
  const toggleCart = useCartStore((state) => state.toggleCart);
  const {
    data: combo,
    isLoading,
    isError,
    error,
    refetch,
    isFetching,
  } = useCombo(slug);
  const toggleWishlist = useWishlistStore((state) => state.toggleWishlist);
  const isWishlisted = useWishlistStore((state) =>
    combo ? state.isWishlisted(combo.id) : false
  );
  const isTogglingWishlist = useWishlistStore((state) =>
    combo ? state.isToggling === combo.id : false
  );
  const { isAuthenticated, _ready } = useAuthStore();
  const isInCart = useCartStore((state) =>
    state.items.some((item) => item.product.slug === slug)
  );
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);

  const statusCode = getErrorStatus(error);
  const isNotFound = statusCode === 404 || statusCode === 400 || !slug;
  const displayCombo: ComboDisplay | null = combo ? { ...combo, itemType: "combo" } : null;

  const handleAddToCart = () => {
    if (!displayCombo || displayCombo.stock <= 0) {
      return;
    }

    const qty = clampQuantity(quantity, displayCombo.stock);
    addItem(
      {
        ...displayCombo,
        itemType: "combo",
      },
      qty
    );
    addToast(`${displayCombo.name} added to cart`, "success");
  };

  const handleWishlist = async () => {
    if (!displayCombo || !_ready || isTogglingWishlist) return;

    if (!isAuthenticated) {
      addToast("Please sign in to use your wishlist", "info");
      router.push(`/login?redirect=${encodeURIComponent(window.location.pathname)}`);
      return;
    }

    try {
      const nextState = await toggleWishlist(displayCombo.id, "combo");
      addToast(
        nextState ? `${displayCombo.name} added to wishlist` : "Removed from wishlist",
        "info"
      );
    } catch {
      addToast("Could not update wishlist. Please try again.", "error");
    }
  };

  if (isLoading) {
    return (
      <div className="mx-auto max-w-[1400px] px-5 py-8 sm:px-6">
        <div className="grid gap-10 lg:grid-cols-[1.05fr_0.95fr]">
          <div className="space-y-4">
            <div className="aspect-square w-full animate-pulse rounded-[2rem] bg-ink/[0.04]" />
            <div className="grid grid-cols-4 gap-3">
              {Array.from({ length: 4 }).map((_, index) => (
                <div key={index} className="aspect-square animate-pulse rounded-2xl bg-ink/[0.04]" />
              ))}
            </div>
          </div>
          <div className="space-y-4">
            <div className="h-5 w-24 animate-pulse rounded-full bg-ink/[0.04]" />
            <div className="h-10 w-3/4 animate-pulse rounded-full bg-ink/[0.04]" />
            <div className="h-6 w-1/3 animate-pulse rounded-full bg-ink/[0.04]" />
            <div className="h-28 w-full animate-pulse rounded-2xl bg-ink/[0.04]" />
            <div className="h-12 w-full animate-pulse rounded-full bg-ink/[0.04]" />
          </div>
        </div>
      </div>
    );
  }

  if (isError && !combo) {
    if (isNotFound) {
      return (
        <div className="mx-auto max-w-2xl px-6 py-20 text-center">
          <h1 className="text-3xl font-light tracking-tight text-neutral-800">
            Bundle not found
          </h1>
          <p className="mt-3 text-neutral-400">
            We could not find that bundle. Please check the bundles page.
          </p>
          <div className="mt-6 flex justify-center gap-3">
            <Button asChild>
              <Link href="/combo">View Bundles</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/shop">Continue Shopping</Link>
            </Button>
          </div>
        </div>
      );
    }

    return (
      <div className="mx-auto max-w-2xl px-6 py-20 text-center">
        <h1 className="text-3xl font-light tracking-tight text-neutral-800">
          Could not load bundle
        </h1>
        <p className="mt-3 text-neutral-400">
          We could not load this bundle right now. Please try again.
        </p>
        <div className="mt-6 flex justify-center gap-3">
          <Button onClick={() => refetch()} disabled={isFetching}>
            {isFetching ? "Retrying..." : "Retry"}
          </Button>
          <Button asChild variant="outline">
            <Link href="/combo">View Bundles</Link>
          </Button>
        </div>
      </div>
    );
  }

  if (!displayCombo) {
    return null;
  }

  const images = displayCombo.images?.length
    ? displayCombo.images
    : ["/images/hero-product.jpg"];
  const currentStock = displayCombo.stock ?? 0;
  const itemCount = displayCombo.reviewCount ?? 0;
  const savings =
    displayCombo.savings ??
    (displayCombo.compareAtPrice && displayCombo.compareAtPrice > displayCombo.price
      ? displayCombo.compareAtPrice - displayCombo.price
      : displayCombo.savings ?? 0);
  const compareAtPrice =
    displayCombo.compareAtPrice && displayCombo.compareAtPrice > displayCombo.price
      ? displayCombo.compareAtPrice
      : savings > 0
        ? displayCombo.price + savings
        : undefined;
  const sizeLabel = displayCombo.volume || displayCombo.size || "";
  const itemTypeLabel = formatLabel(displayCombo.itemType ?? "combo");

  return (
    <div className="bg-white pb-28 md:pb-0">
      <div className="mx-auto max-w-[1400px] px-5 py-6 sm:px-6 lg:py-8">
        <nav className="mb-8 flex items-center gap-2 text-xs uppercase tracking-[0.22em] text-ink/40">
          <Link href="/" className="transition-colors hover:text-ink">
            Home
          </Link>
          <span>›</span>
          <Link href="/combo" className="transition-colors hover:text-ink">
            Bundles
          </Link>
          <span>›</span>
          <span className="line-clamp-1 normal-case tracking-normal text-ink/60">
            {displayCombo.name}
          </span>
        </nav>

        <section className="grid gap-9 lg:grid-cols-[minmax(0,1.05fr)_minmax(360px,0.95fr)] lg:items-start lg:gap-12">
          <div className="lg:sticky lg:top-24 lg:self-start">
            <div className="space-y-4">
              <div className="relative aspect-square overflow-hidden rounded-[2rem] bg-[#F7F8F4]">
                {displayCombo.badge ? (
                  <span className="absolute left-5 top-5 z-10 rounded-full border border-ink/25 bg-white/80 px-4 py-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-ink/65 backdrop-blur">
                    {displayCombo.badge}
                  </span>
                ) : null}
                <ProductImage
                  src={images[selectedImage]}
                  alt={displayCombo.name}
                  fill
                  className="object-contain p-5"
                  sizes="(max-width: 768px) 100vw, 52rem"
                  fallbackId={displayCombo.id}
                />
              </div>

              {images.length > 1 ? (
                <div className="grid grid-cols-4 gap-3">
                  {images.slice(0, 4).map((image, index) => (
                    <button
                      key={`${image}-${index}`}
                      type="button"
                      onClick={() => setSelectedImage(index)}
                      className={cn(
                        "relative aspect-square overflow-hidden rounded-2xl border bg-[#FAF9F7]",
                        index === selectedImage ? "border-accent" : "border-ink/10"
                      )}
                    >
                      <ProductImage
                        src={image}
                        alt={`${displayCombo.name} image ${index + 1}`}
                        fill
                        className="object-contain p-2"
                        sizes="96px"
                        fallbackId={`${displayCombo.id}-${index}`}
                      />
                    </button>
                  ))}
                </div>
              ) : null}
            </div>
          </div>

          <div className="flex flex-col gap-5 lg:pt-1">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-ink/45">
                {itemTypeLabel}
              </p>
              <h1 className="mt-2 max-w-xl text-4xl font-serif font-medium leading-[1.05] text-ink sm:text-5xl">
                {displayCombo.name}
              </h1>
              <div className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-2 text-sm text-ink/55">
                <div className="flex items-center gap-1 text-gold">
                  {[0, 1, 2, 3, 4].map((index) => (
                    <Star
                      key={index}
                      className={cn(
                        "h-4 w-4",
                        index < Math.floor(displayCombo.rating)
                          ? "fill-gold text-gold"
                          : "fill-border text-border"
                      )}
                    />
                  ))}
                </div>
                <span>
                  {displayCombo.rating.toFixed(1)} â€¢ {itemCount} reviews
                </span>
                {sizeLabel ? <span>{sizeLabel}</span> : null}
              </div>
            </div>

            {displayCombo.badge ? (
              <Badge variant="outline" className="w-fit border-rose-200 bg-rose-50 text-rose-700">
                {displayCombo.badge}
              </Badge>
            ) : null}

            <div className="space-y-4">
              <p className="max-w-xl text-sm leading-7 text-ink/60">
                {displayCombo.description}
              </p>

              {displayCombo.includedItems?.length ? (
                <div className="flex flex-wrap gap-2">
                  {displayCombo.includedItems.map((item) => (
                    <span
                      key={item}
                      className="rounded-full border border-ink/10 bg-[#FAF9F7] px-3 py-1.5 text-xs text-ink/65"
                    >
                      {item}
                    </span>
                  ))}
                </div>
              ) : null}
            </div>

            <div className="grid gap-3 rounded-3xl border border-rose-100 bg-rose-50/40 p-5 sm:grid-cols-3">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-ink/35">
                  Price
                </p>
                <div className="mt-2 flex items-baseline gap-2">
                  {compareAtPrice && compareAtPrice > displayCombo.price ? (
                    <span className="text-sm text-ink/35 line-through">
                      {formatPrice(compareAtPrice)}
                    </span>
                  ) : null}
                  <span className="text-lg font-semibold text-ink">
                    {formatPrice(displayCombo.price)}
                  </span>
                </div>
              </div>
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-ink/35">
                  Savings
                </p>
                <p className="mt-2 text-lg font-semibold text-emerald-700">
                  {savings > 0 ? formatPrice(savings) : formatPrice(0)}
                </p>
              </div>
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-ink/35">
                  Stock
                </p>
                <p className="mt-2 text-lg font-semibold text-ink">
                  {currentStock > 0 ? `${currentStock} available` : "Out of stock"}
                </p>
              </div>
            </div>

            <Card className="border-rose-100">
              <CardContent className="p-5">
                <div className="grid gap-3 text-sm text-neutral-600 sm:grid-cols-2">
                  <div>
                    <p className="text-xs uppercase tracking-wider text-neutral-400">
                      Routine tag
                    </p>
                    <p className="mt-1 font-medium text-neutral-800">
                      {displayCombo.routineTag || "Bundle routine"}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-wider text-neutral-400">
                      Bundle size
                    </p>
                    <p className="mt-1 font-medium text-neutral-800">
                      {sizeLabel || "Bundle"}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-wider text-neutral-400">
                      Payment
                    </p>
                    <p className="mt-1 font-medium text-neutral-800">
                      Cash on Delivery
                    </p>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-wider text-neutral-400">
                      Payment status
                    </p>
                    <p className="mt-1 font-medium text-neutral-800">
                      Pending payment
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="flex items-center gap-3">
              <div className="flex h-11 shrink-0 items-center rounded-full border border-ink/15">
                <button
                  type="button"
                  onClick={() => setQuantity((current) => clampQuantity(current - 1, currentStock))}
                  disabled={quantity <= 1}
                  className="flex h-11 w-10 items-center justify-center text-ink/55 transition-colors hover:text-ink"
                  aria-label="Decrease quantity"
                >
                  <Minus className="h-4 w-4" />
                </button>
                <span className="w-8 text-center text-sm font-semibold">{quantity}</span>
                <button
                  type="button"
                  onClick={() => setQuantity((current) => clampQuantity(current + 1, currentStock))}
                  disabled={quantity >= currentStock || currentStock <= 0}
                  className="flex h-11 w-10 items-center justify-center text-ink/55 transition-colors hover:text-ink disabled:cursor-not-allowed disabled:text-neutral-300 disabled:hover:text-neutral-300"
                  aria-label="Increase quantity"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>

              {isInCart ? (
                <>
                  <button
                    type="button"
                    onClick={() => toggleCart()}
                    className={cn(
                      "flex h-11 flex-1 items-center justify-center gap-2 rounded-full text-sm font-semibold transition-colors",
                      "bg-success text-white hover:bg-success/90"
                    )}
                  >
                    <Package className="h-4 w-4" />
                    View Cart
                  </button>
                  <button
                    type="button"
                    onClick={handleWishlist}
                    disabled={isTogglingWishlist}
                    className={cn(
                      "flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-ink/25 bg-white transition-all hover:border-accent/50 hover:text-accent",
                      isWishlisted && "border-accent/25 bg-accent-pale text-accent",
                      isTogglingWishlist && "cursor-wait opacity-70"
                    )}
                    aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
                  >
                    <Heart className={cn("h-5 w-5", isWishlisted && "fill-current")} />
                  </button>
                </>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={handleAddToCart}
                    disabled={currentStock === 0}
                    className={cn(
                      "flex h-11 flex-1 items-center justify-center gap-2 rounded-full text-sm font-semibold transition-colors",
                      currentStock === 0
                        ? "cursor-not-allowed bg-neutral-200 text-neutral-500"
                        : "bg-[#4B3858] text-white hover:bg-accent-dark"
                    )}
                  >
                    <Package className="h-4 w-4" />
                    Add to Cart
                  </button>
                  <button
                    type="button"
                    onClick={handleWishlist}
                    disabled={isTogglingWishlist}
                    className={cn(
                      "flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-ink/25 bg-white transition-all hover:border-accent/50 hover:text-accent",
                      isWishlisted && "border-accent/25 bg-accent-pale text-accent",
                      isTogglingWishlist && "cursor-wait opacity-70"
                    )}
                    aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
                  >
                    <Heart className={cn("h-5 w-5", isWishlisted && "fill-current")} />
                  </button>
                </>
              )}
            </div>

            <div className="rounded-3xl bg-[#FAF9F7] p-5">
              <div className="flex items-center gap-2 font-medium text-neutral-800">
                <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                Bundle details
              </div>
              <p className="mt-2 text-sm leading-7 text-neutral-600">
                {displayCombo.description}
              </p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
