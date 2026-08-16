"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowRight,
  Check,
  ChevronRight,
  Droplets,
  Feather,
  Heart,
  Minus,
  Plus,
  RotateCcw,
  Shield,
  ShoppingBag,
  Sparkles,
  Star,
  Truck,
  X,
  Zap,
  ZoomIn,
} from "lucide-react";
import { useProduct } from "@/hooks/use-products";
import { useCartStore } from "@/store/cart.store";
import { useToastStore } from "@/store/toast.store";
import { useWishlistStore } from "@/store/wishlist.store";
import { useAuthStore } from "@/store/auth.store";
import { Skeleton } from "@/components/ui/skeleton";
import { ProductCard } from "@/components/product/product-card";
import { DUMMY_PRODUCTS } from "@/constants/site";
import { cn, formatPrice } from "@/lib/utils";
import type { Product, SizeOption } from "@/types/product";

const SAMPLE_REVIEWS = [
  {
    author: "Nusrat J.",
    location: "Dhaka",
    rating: 5,
    date: "2 weeks ago",
    text: "Absolutely love this. Delivery was fast and the product is 100% authentic. My skin has never felt better.",
  },
  {
    author: "Tanvir H.",
    location: "Chattogram",
    rating: 5,
    date: "1 month ago",
    text: "Been using this for a few weeks now. Genuine product, beautifully packaged. Will definitely repurchase.",
  },
  {
    author: "Sadia M.",
    location: "Sylhet",
    rating: 4,
    date: "1 month ago",
    text: "Works well and the price is fair. Took a bit to arrive outside Dhaka but customer service was very helpful.",
  },
];

const ROUTINE_STEPS = [
  { id: "cleanse", label: "Cleanse", categories: ["cleanser", "cleansers", "cleansing-oil"] },
  { id: "tone", label: "Tone", categories: ["toner", "toners"] },
  { id: "treat", label: "Treat", categories: ["serum", "serums", "essence", "essences", "ampoule", "ampoules", "treatment"] },
  { id: "moisturize", label: "Moisturize", categories: ["moisturizer", "moisturizers", "cream", "creams"] },
  { id: "protect", label: "Protect", categories: ["sun-care", "sunscreen", "spf"] },
];

const TRUST_ITEMS = [
  {
    title: "100% Authentic",
    text: "Verified Korean products",
    icon: Shield,
  },
  {
    title: "Fast Delivery",
    text: "Free over BDT 2,000 in Dhaka",
    icon: Truck,
  },
  {
    title: "Easy Returns",
    text: "Within 7 days",
    icon: RotateCcw,
  },
];

function splitValues(value?: string | string[]) {
  if (!value) return [];
  const values = Array.isArray(value) ? value : value.split(/[,/|]+/);
  return values.map((item) => item.trim()).filter(Boolean);
}

function formatCategory(category: string) {
  return category
    .split(/[-_\s]+/)
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

function getRoutineStep(product: Product) {
  const category = product.category.toLowerCase();
  const name = product.name.toLowerCase();
  return (
    ROUTINE_STEPS.find((step) =>
      step.categories.some((item) => category.includes(item) || name.includes(item)),
    ) ?? ROUTINE_STEPS[2]
  );
}

function getBenefitChips(product: Product) {
  const chips = [...(product.tags ?? []), ...(product.concerns ?? [])]
    .map((item) => formatCategory(item))
    .filter(Boolean);
  if (product.skinType) chips.push(product.skinType);
  return Array.from(new Set(chips)).slice(0, 3);
}

function getBenefitStatement(product: Product) {
  const source = product.description || product.longDescription;
  if (!source) return "Targeted Korean skincare selected for a balanced, healthy-looking routine.";
  return source.length > 118 ? `${source.slice(0, 115).trim()}...` : source;
}

function getIngredientCards(product: Product) {
  if (!product.ingredients) return [];
  return product.ingredients
    .split(/[,;\n]+/)
    .map((ingredient) => ingredient.trim())
    .filter(Boolean)
    .slice(0, 4)
    .map((ingredient) => ({
      name: ingredient,
      text: "Included in this formula to support the product's stated skincare benefits.",
    }));
}

function getTexture(product: Product) {
  const text = `${product.name} ${product.description} ${product.longDescription ?? ""}`.toLowerCase();
  if (text.includes("gel")) return "Gel · Fresh";
  if (text.includes("cream") || text.includes("rich")) return "Cream · Comforting";
  if (text.includes("oil")) return "Silky oil · Rinses clean";
  if (text.includes("lightweight") || text.includes("serum") || text.includes("ampoule")) {
    return "Lightweight · Fast absorbing";
  }
  return "";
}

function getFinish(product: Product) {
  const text = `${product.description} ${product.longDescription ?? ""}`.toLowerCase();
  if (text.includes("no white cast")) return "No white cast · Natural";
  if (text.includes("non-greasy") || text.includes("non greasy")) return "Fresh · Non-greasy";
  if (text.includes("glow") || text.includes("plump")) return "Healthy glow · Plump";
  return "";
}

function getRoutineProducts(product: Product) {
  const candidates = DUMMY_PRODUCTS.filter(
    (item) => item.id !== product.id && item.category !== "combo" && item.category !== "sets",
  );

  return ROUTINE_STEPS.map((step) => {
    const isCurrent = step.id === getRoutineStep(product).id;
    const match = candidates.find((item) => getRoutineStep(item).id === step.id);
    return {
      step,
      product: isCurrent ? product : match,
      isCurrent,
    };
  });
}

function StarRating({ rating, size = "sm" }: { rating: number; size?: "xs" | "sm" }) {
  return (
    <div className="flex items-center gap-0.5 text-gold">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className={cn(
            size === "xs" ? "h-3 w-3" : "h-4 w-4",
            i < Math.floor(rating) ? "fill-gold text-gold" : "fill-border text-border",
          )}
        />
      ))}
    </div>
  );
}

export default function ProductPage() {
  const { slug } = useParams<{ slug: string }>();
  const router = useRouter();
  const { data: product, isLoading } = useProduct(slug);
  const { addItem } = useCartStore();
  const addToast = useToastStore((s) => s.addToast);
  const isWishlisted = useWishlistStore((s) =>
    product ? s.isWishlisted(product.id) : false,
  );
  const toggleWishlist = useWishlistStore((s) => s.toggleWishlist);
  const isTogglingWishlist = useWishlistStore((s) =>
    product ? s.isToggling === product.id : false,
  );
  const { isAuthenticated, _ready } = useAuthStore();
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedSize, setSelectedSize] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const mobileGalleryRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!lightboxOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setLightboxOpen(false);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [lightboxOpen]);

  const sizeOptions: SizeOption[] =
    product && product.sizeOptions && product.sizeOptions.length > 0
      ? product.sizeOptions
      : product
        ? [
            {
              label: "Default",
              volume: product.volume ?? "",
              price: product.price,
              compareAtPrice: product.compareAtPrice,
              stock: product.stock,
            },
          ]
        : [];

  const selectedSizeOption = sizeOptions[selectedSize] ?? sizeOptions[0];
  const displayPrice = selectedSizeOption?.price ?? product?.price ?? 0;
  const compareAtPrice =
    selectedSizeOption?.compareAtPrice ?? product?.compareAtPrice;

  const addToCart = (qty: number = quantity) => {
    if (!product) return;
    addItem(
      {
        ...product,
        price: displayPrice,
        compareAtPrice,
      },
      qty,
    );
    addToast(`${product.name} added to cart`);
    setQuantity(1);
  };

  const handleBuyNow = () => {
    if (!product) return;
    addItem(
      {
        ...product,
        price: displayPrice,
        compareAtPrice,
      },
      quantity,
    );
    addToast("Proceeding to checkout...", "info");
    router.push("/checkout");
  };

  const handleWishlist = async () => {
    if (!product || !_ready || isTogglingWishlist) return;

    if (!isAuthenticated) {
      addToast("Please sign in to use your wishlist", "info");
      router.push(`/login?redirect=${encodeURIComponent(window.location.pathname)}`);
      return;
    }

    try {
      const nextState = await toggleWishlist(
        product.id,
        product.category === "combo" ? "combo" : "product",
      );
      addToast(
        nextState ? `${product.name} added to wishlist` : "Removed from wishlist",
        "info",
      );
    } catch {
      addToast("Could not update wishlist. Please try again.", "error");
    }
  };

  const relatedProducts = useMemo(
    () =>
      product
        ? DUMMY_PRODUCTS.filter(
            (p) =>
              p.id !== product.id && p.category !== "combo" && p.category !== "sets",
          ).slice(0, 4)
        : [],
    [product],
  );

  if (isLoading) {
    return (
      <div className="mx-auto max-w-[1400px] px-5 py-8 sm:px-6">
        <div className="grid gap-10 lg:grid-cols-[1.05fr_0.95fr]">
          <Skeleton className="aspect-square w-full rounded-[2rem] bg-ink/[0.04]" />
          <div className="space-y-4">
            <Skeleton className="h-5 w-24 bg-ink/[0.04]" />
            <Skeleton className="h-10 w-3/4 bg-ink/[0.04]" />
            <Skeleton className="h-6 w-1/3 bg-ink/[0.04]" />
            <Skeleton className="h-28 w-full bg-ink/[0.04]" />
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
        <Link
          href="/shop"
          className="mt-4 inline-block text-sm font-medium text-accent hover:underline"
        >
          Back to Shop
        </Link>
      </div>
    );
  }

  const images = product.images?.length ? product.images : ["/images/hero-product.jpg"];
  const routineStep = getRoutineStep(product);
  const benefitChips = getBenefitChips(product);
  const ingredients = getIngredientCards(product);
  const routineProducts = getRoutineProducts(product);
  const skinTypes = splitValues(product.skinType);
  const stockText =
    product.stock > 0
      ? `In Stock · ${product.stock <= 20 ? `Only ${product.stock} left` : "Ready to ship"}`
      : "Out of stock";
  const metaItems = [
    { label: "Size", value: selectedSizeOption?.volume || product.volume || product.size },
    { label: "Skin Type", value: skinTypes.join(" · ") },
    { label: "Concerns", value: product.concerns?.join(" · ") },
  ].filter((item) => item.value);
  const profileItems = [
    { label: "Skin Type", values: skinTypes },
    { label: "Skin Concerns", values: product.concerns ?? [] },
    { label: "Texture", values: getTexture(product) ? [getTexture(product)] : [] },
    { label: "Finish", values: getFinish(product) ? [getFinish(product)] : [] },
  ].filter((item) => item.values.length > 0);

  return (
    <div className="bg-white pb-28 md:pb-0">
      <div className="mx-auto max-w-[1400px] px-5 py-6 sm:px-6 lg:py-8">
        <nav className="mb-8 flex items-center gap-2 text-xs uppercase tracking-[0.22em] text-ink/40">
          <Link href="/" className="transition-colors hover:text-ink">
            Home
          </Link>
          <ChevronRight className="h-3 w-3" />
          <Link href="/shop" className="transition-colors hover:text-ink">
            Shop
          </Link>
          <ChevronRight className="h-3 w-3" />
          <span className="line-clamp-1 normal-case tracking-normal text-ink/60">
            {product.name}
          </span>
        </nav>

        <section className="grid gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:gap-16">
          <div className="lg:sticky lg:top-24 lg:self-start">
            <div className="hidden gap-4 md:flex">
              {images.length > 1 && (
                <div className="flex w-20 flex-col gap-3">
                  {images.map((image, index) => (
                    <button
                      key={image + index}
                      onClick={() => setSelectedImage(index)}
                      className={cn(
                        "relative aspect-square overflow-hidden rounded-2xl border bg-surface-warm transition-all",
                        selectedImage === index
                          ? "border-accent/70"
                          : "border-transparent opacity-70 hover:border-ink/15 hover:opacity-100",
                      )}
                      aria-label={`View image ${index + 1}`}
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

              <button
                onClick={() => setLightboxOpen(true)}
                className="group relative aspect-square flex-1 overflow-hidden rounded-[2rem] bg-[#FAF9F7]"
                aria-label="Zoom product image"
              >
                <Image
                  src={images[selectedImage]}
                  alt={product.name}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-[1.025]"
                  sizes="(max-width: 1024px) 100vw, 48vw"
                  priority
                />
                <span className="absolute bottom-5 right-5 flex h-10 w-10 items-center justify-center rounded-full bg-white/85 text-ink/65 shadow-sm backdrop-blur transition-colors group-hover:text-ink">
                  <ZoomIn className="h-4 w-4" />
                </span>
              </button>
            </div>

            <div className="md:hidden">
              <div
                ref={mobileGalleryRef}
                onScroll={(event) => {
                  const target = event.currentTarget;
                  const itemWidth = target.scrollWidth / images.length;
                  const index = Math.min(
                    images.length - 1,
                    Math.max(0, Math.round(target.scrollLeft / itemWidth)),
                  );
                  setSelectedImage(index);
                }}
                className="flex snap-x snap-mandatory gap-3 overflow-x-auto pb-3"
              >
                {images.map((image, index) => (
                  <button
                    key={image + index}
                    onClick={() => {
                      setSelectedImage(index);
                      setLightboxOpen(true);
                    }}
                    className="relative aspect-square w-full min-w-full snap-center overflow-hidden rounded-[1.75rem] bg-[#FAF9F7]"
                    aria-label={`Open image ${index + 1}`}
                  >
                    <Image
                      src={image}
                      alt={`${product.name} image ${index + 1}`}
                      fill
                      className="object-cover"
                      sizes="100vw"
                      priority={index === 0}
                    />
                  </button>
                ))}
              </div>
              <div className="flex items-center justify-center gap-2 text-xs text-ink/45">
                {images.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      setSelectedImage(index);
                      const target = mobileGalleryRef.current;
                      if (!target) return;
                      target.scrollTo({
                        left: (target.scrollWidth / images.length) * index,
                        behavior: "smooth",
                      });
                    }}
                    className={cn(
                      "h-1.5 rounded-full transition-all",
                      selectedImage === index ? "w-6 bg-ink" : "w-1.5 bg-ink/20",
                    )}
                    aria-label={`Select image ${index + 1}`}
                  />
                ))}
                <span className="ml-2">
                  {selectedImage + 1} / {images.length}
                </span>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-7">
            <div>
              {product.brand && (
                <p className="text-xs font-bold uppercase tracking-[0.26em] text-accent">
                  {product.brand}
                </p>
              )}
              <h1 className="mt-3 text-4xl font-serif font-medium leading-[1.05] text-ink sm:text-5xl">
                {product.name}
              </h1>
              <div className="mt-5 flex flex-wrap items-center gap-x-3 gap-y-2 text-sm text-ink/55">
                <StarRating rating={product.rating} />
                <span className="font-medium text-ink">{product.rating}</span>
                <span>·</span>
                <span>{product.reviewCount} Reviews</span>
              </div>
            </div>

            <div>
              <div className="flex flex-wrap items-baseline gap-3">
                <span className="text-3xl font-semibold tracking-tight text-ink">
                  {formatPrice(displayPrice)}
                </span>
                {compareAtPrice && compareAtPrice > displayPrice && (
                  <span className="text-lg text-ink/35 line-through">
                    {formatPrice(compareAtPrice)}
                  </span>
                )}
                {product.krw && <span className="text-sm text-ink/35">{product.krw}</span>}
              </div>
              <p
                className={cn(
                  "mt-3 text-sm font-medium",
                  product.stock > 0 ? "text-success" : "text-red-500",
                )}
              >
                {stockText}
              </p>
            </div>

            <div className="space-y-4">
              <p className="max-w-xl text-lg leading-relaxed text-ink/70">
                {getBenefitStatement(product)}
              </p>
              {benefitChips.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {benefitChips.map((chip) => (
                    <span
                      key={chip}
                      className="rounded-full border border-accent/15 bg-accent-pale/60 px-3.5 py-2 text-xs font-semibold text-accent-dark"
                    >
                      {chip}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {sizeOptions.length > 1 && (
              <div>
                <p className="mb-2 text-xs font-semibold uppercase tracking-[0.22em] text-ink/40">
                  Select Size
                </p>
                <div className="flex flex-wrap gap-2">
                  {sizeOptions.map((opt, i) => (
                    <button
                      key={`${opt.label}-${i}`}
                      onClick={() => setSelectedSize(i)}
                      className={cn(
                        "rounded-2xl border px-4 py-3 text-left transition-all",
                        selectedSize === i
                          ? "border-ink bg-ink text-white"
                          : "border-ink/10 bg-white hover:border-ink/30",
                      )}
                    >
                      <span className="block text-sm font-medium">{opt.label}</span>
                      <span
                        className={cn(
                          "block text-xs",
                          selectedSize === i ? "text-white/70" : "text-ink/45",
                        )}
                      >
                        {formatPrice(opt.price)}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {metaItems.length > 0 && (
              <div className="grid gap-4 border-y border-ink/10 py-5 sm:grid-cols-3">
                {metaItems.map((item) => (
                  <div key={item.label}>
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-ink/35">
                      {item.label}
                    </p>
                    <p className="mt-2 text-sm leading-relaxed text-ink/75">{item.value}</p>
                  </div>
                ))}
              </div>
            )}

            <div className="rounded-[1.75rem] border border-ink/10 bg-[#FAF9F7] p-4 sm:p-5">
              <div className="flex items-center gap-3">
                <div className="flex h-12 items-center rounded-full border border-ink/15 bg-white">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="flex h-12 w-11 items-center justify-center text-ink/55 transition-colors hover:text-ink"
                    aria-label="Decrease quantity"
                  >
                    <Minus className="h-4 w-4" />
                  </button>
                  <span className="w-9 text-center text-sm font-semibold">{quantity}</span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="flex h-12 w-11 items-center justify-center text-ink/55 transition-colors hover:text-ink"
                    aria-label="Increase quantity"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>

                <button
                  onClick={() => addToCart()}
                  disabled={product.stock === 0}
                  className={cn(
                    "flex h-12 flex-1 items-center justify-center gap-2 rounded-full text-sm font-semibold transition-colors",
                    product.stock === 0
                      ? "cursor-not-allowed bg-neutral-200 text-neutral-500"
                      : "bg-ink text-white hover:bg-accent-dark",
                  )}
                >
                  <ShoppingBag className="h-4 w-4" />
                  Add to Cart
                </button>

                <button
                  onClick={handleWishlist}
                  disabled={isTogglingWishlist}
                  className={cn(
                    "flex h-12 w-12 items-center justify-center rounded-full border border-ink/15 bg-white transition-all hover:border-accent/50 hover:text-accent",
                    isWishlisted && "border-accent/25 bg-accent-pale text-accent",
                    isTogglingWishlist && "cursor-wait opacity-70",
                  )}
                  aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
                >
                  <Heart className={cn("h-5 w-5", isWishlisted && "fill-current")} />
                </button>
              </div>

              <button
                onClick={handleBuyNow}
                disabled={product.stock === 0}
                className={cn(
                  "mt-3 flex h-12 w-full items-center justify-center gap-2 rounded-full text-sm font-semibold transition-colors",
                  product.stock === 0
                    ? "cursor-not-allowed bg-neutral-200 text-neutral-500"
                    : "bg-accent text-white hover:bg-accent-dark",
                )}
              >
                <Zap className="h-4 w-4" />
                Buy Now
              </button>

              <p className="mt-4 text-center text-xs text-ink/45">
                Secure checkout · bKash · Nagad · Rocket · COD
              </p>
            </div>
          </div>
        </section>

        <section className="mt-10 grid gap-4 border-y border-ink/10 py-6 md:grid-cols-3">
          {TRUST_ITEMS.map((item) => {
            const Icon = item.icon;
            return (
              <div key={item.title} className="flex items-start gap-3">
                <span className="mt-0.5 flex h-9 w-9 items-center justify-center rounded-full bg-accent-pale text-accent">
                  <Icon className="h-4 w-4" />
                </span>
                <div>
                  <h3 className="font-sans text-sm font-semibold text-ink">{item.title}</h3>
                  <p className="mt-1 text-sm text-ink/50">{item.text}</p>
                </div>
              </div>
            );
          })}
        </section>
      </div>

      <section className="bg-[#FAF9F7] py-16 sm:py-20 lg:py-28">
        <div className="mx-auto grid max-w-[1400px] gap-10 px-5 sm:px-6 lg:grid-cols-2 lg:items-center lg:gap-16">
          <div className="relative aspect-[4/5] overflow-hidden rounded-[2rem] bg-white lg:aspect-[5/4]">
            <Image
              src={images[1] ?? product.hoverImage ?? images[0]}
              alt={`${product.name} texture and packaging`}
              fill
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 50vw"
            />
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.28em] text-accent">
              Why You&apos;ll Love It
            </p>
            <h2 className="mt-4 text-3xl font-serif font-medium text-ink sm:text-4xl">
              Targeted care, edited for your daily skin ritual.
            </h2>
            <p className="mt-5 max-w-xl text-base leading-8 text-ink/60">
              {product.longDescription || product.description}
            </p>
            <div className="mt-8 grid gap-5">
              {[
                {
                  icon: Droplets,
                  title: benefitChips[0] ?? "Daily Hydration",
                  text: "Helps replenish moisture and keep skin feeling comfortable.",
                },
                {
                  icon: Sparkles,
                  title: benefitChips[1] ?? "Healthy Glow",
                  text: "Supports smoother, fresher-looking skin with consistent use.",
                },
                {
                  icon: Feather,
                  title: benefitChips[2] ?? "Light Feel",
                  text: "Designed to fit easily into a layered Korean skincare routine.",
                },
              ].map((item) => {
                const Icon = item.icon;
                return (
                  <div key={item.title} className="flex gap-4">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white text-accent">
                      <Icon className="h-4 w-4" />
                    </span>
                    <div>
                      <h3 className="font-sans text-base font-semibold text-ink">
                        {item.title}
                      </h3>
                      <p className="mt-1 text-sm leading-6 text-ink/55">{item.text}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {ingredients.length > 0 && (
        <section className="bg-white py-16 sm:py-20 lg:py-28">
          <div className="mx-auto max-w-[1400px] px-5 sm:px-6">
            <div className="max-w-2xl">
              <p className="text-xs font-bold uppercase tracking-[0.28em] text-accent">
                Formula Notes
              </p>
              <h2 className="mt-4 text-3xl font-serif font-medium text-ink sm:text-4xl">
                Key Ingredients
              </h2>
            </div>
            <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {ingredients.map((ingredient) => (
                <div
                  key={ingredient.name}
                  className="rounded-[1.5rem] border border-ink/10 bg-[#FAF9F7] p-6 transition-transform hover:-translate-y-0.5"
                >
                  <h3 className="font-sans text-base font-semibold text-ink">
                    {ingredient.name}
                  </h3>
                  <p className="mt-3 text-sm leading-6 text-ink/55">{ingredient.text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      <section className="bg-[#FCF7F8] py-16 sm:py-20 lg:py-28">
        <div className="mx-auto max-w-[1400px] px-5 sm:px-6">
          <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:items-start">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.28em] text-accent">
                Routine Position
              </p>
              <h2 className="mt-4 text-3xl font-serif font-medium text-ink sm:text-4xl">
                How to Use
              </h2>
              <div className="mt-6 rounded-[1.5rem] bg-white p-6">
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-ink/35">
                  AM + PM
                </p>
                <p className="mt-3 text-base leading-7 text-ink/65">
                  {product.howToUse ||
                    "Apply after cleansing and toning. Layer gently, then follow with moisturizer and SPF in the morning."}
                </p>
              </div>
            </div>
            <div className="overflow-x-auto">
              <div className="flex min-w-[760px] items-stretch gap-3">
                {ROUTINE_STEPS.map((step, index) => {
                  const active = step.id === routineStep.id;
                  return (
                    <div
                      key={step.id}
                      className={cn(
                        "relative flex flex-1 flex-col justify-between rounded-[1.5rem] border p-5",
                        active
                          ? "border-accent bg-white text-ink"
                          : "border-white/70 bg-white/55 text-ink/45",
                      )}
                    >
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.2em]">
                          {String(index + 1).padStart(2, "0")}
                        </p>
                        <h3 className="mt-3 font-sans text-base font-semibold">
                          {step.label}
                        </h3>
                      </div>
                      {active && (
                        <p className="mt-8 inline-flex items-center gap-1 text-xs font-bold uppercase tracking-[0.16em] text-accent">
                          You are here <Check className="h-3.5 w-3.5" />
                        </p>
                      )}
                      {index < ROUTINE_STEPS.length - 1 && (
                        <ArrowRight className="absolute -right-4 top-1/2 z-10 h-5 w-5 -translate-y-1/2 text-ink/25" />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </section>

      {profileItems.length > 0 && (
        <section className="bg-white py-16 sm:py-20 lg:py-28">
          <div className="mx-auto max-w-[1400px] px-5 sm:px-6">
            <div className="rounded-[2rem] bg-[#FAF8F6] p-6 sm:p-10 lg:p-12">
              <h2 className="text-3xl font-serif font-medium text-ink sm:text-4xl">
                Is It Right for Your Skin?
              </h2>
              <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                {profileItems.map((item) => (
                  <div key={item.label}>
                    <h3 className="font-sans text-sm font-semibold text-ink">
                      {item.label}
                    </h3>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {item.values.map((value) => (
                        <span
                          key={value}
                          className="rounded-full bg-white px-3 py-1.5 text-xs font-medium text-ink/60"
                        >
                          {value}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      <section className="bg-[#FAF9F7] py-16 sm:py-20 lg:py-28">
        <div className="mx-auto max-w-[1400px] px-5 sm:px-6">
          <div className="max-w-2xl">
            <p className="text-xs font-bold uppercase tracking-[0.28em] text-accent">
              Routine Builder
            </p>
            <h2 className="mt-4 text-3xl font-serif font-medium text-ink sm:text-4xl">
              Complete the Ritual
            </h2>
            <p className="mt-4 text-sm leading-6 text-ink/55">
              Build a balanced skincare journey around the product you&apos;re viewing.
            </p>
          </div>
          <div className="mt-10 overflow-x-auto pb-2">
            <div className="flex min-w-[980px] gap-4">
              {routineProducts.map(({ step, product: routineProduct, isCurrent }, index) => (
                <div
                  key={step.id}
                  className={cn(
                    "relative flex w-56 shrink-0 flex-col rounded-[1.75rem] border bg-white p-4",
                    isCurrent ? "border-accent" : "border-ink/10",
                  )}
                >
                  <p className="text-xs font-bold uppercase tracking-[0.22em] text-ink/35">
                    {String(index + 1).padStart(2, "0")} {step.label}
                  </p>
                  {routineProduct ? (
                    <>
                      <Link
                        href={`/product/${routineProduct.slug}`}
                        className="relative mt-4 aspect-square overflow-hidden rounded-2xl bg-[#FAF9F7]"
                      >
                        <Image
                          src={routineProduct.images[0]}
                          alt={routineProduct.name}
                          fill
                          className="object-cover"
                          sizes="224px"
                        />
                      </Link>
                      <div className="mt-4 flex-1">
                        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-accent">
                          {routineProduct.brand}
                        </p>
                        <Link
                          href={`/product/${routineProduct.slug}`}
                          className="mt-1 line-clamp-2 block font-sans text-sm font-semibold leading-5 text-ink transition-colors hover:text-accent"
                        >
                          {routineProduct.name}
                        </Link>
                        <p className="mt-2 text-sm font-semibold text-ink">
                          {formatPrice(routineProduct.price)}
                        </p>
                      </div>
                      {isCurrent ? (
                        <div className="mt-4 rounded-full bg-accent-pale px-3 py-2 text-center text-xs font-bold uppercase tracking-[0.16em] text-accent">
                          You are here
                        </div>
                      ) : (
                        <button
                          onClick={() => {
                            addItem(routineProduct, 1);
                            addToast(`${routineProduct.name} added to cart`);
                          }}
                          className="mt-4 rounded-full border border-ink/15 py-2 text-sm font-medium text-ink transition-colors hover:border-ink hover:bg-ink hover:text-white"
                        >
                          Add to Routine
                        </button>
                      )}
                    </>
                  ) : (
                    <div className="mt-4 flex aspect-square items-center justify-center rounded-2xl bg-[#FAF9F7] text-center text-sm text-ink/35">
                      No product selected
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="bg-white py-16 sm:py-20 lg:py-28">
        <div className="mx-auto grid max-w-[1400px] gap-10 px-5 sm:px-6 lg:grid-cols-[0.85fr_1.15fr]">
          <div>
            <h2 className="text-3xl font-serif font-medium text-ink sm:text-4xl">
              Customer Reviews
            </h2>
            <div className="mt-8 rounded-[1.75rem] bg-[#FAF9F7] p-6">
              <p className="text-5xl font-semibold tracking-tight text-ink">
                {product.rating} / 5
              </p>
              <div className="mt-3">
                <StarRating rating={product.rating} />
              </div>
              <p className="mt-3 text-sm text-ink/50">
                Based on {product.reviewCount} reviews
              </p>
              <div className="mt-6 space-y-2">
                {[5, 4, 3, 2, 1].map((rating) => {
                  const width =
                    rating === 5 ? "88%" : rating === 4 ? "24%" : rating === 3 ? "12%" : "3%";
                  return (
                    <div key={rating} className="flex items-center gap-3 text-xs text-ink/50">
                      <span className="w-8">{rating} ★</span>
                      <span className="h-1.5 flex-1 overflow-hidden rounded-full bg-white">
                        <span
                          className="block h-full rounded-full bg-gold"
                          style={{ width }}
                        />
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <div>
            <div className="mb-6 flex flex-wrap gap-2">
              {["All", "5 Stars", "With Photos", "Dry Skin", "Sensitive Skin"].map((filter) => (
                <button
                  key={filter}
                  className="rounded-full border border-ink/10 px-4 py-2 text-xs font-semibold text-ink/55 transition-colors hover:border-accent/30 hover:text-accent"
                >
                  {filter}
                </button>
              ))}
            </div>
            <div className="space-y-4">
              {SAMPLE_REVIEWS.map((review) => (
                <article
                  key={review.author}
                  className="rounded-[1.5rem] border border-ink/10 p-5"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <h3 className="font-sans text-sm font-semibold text-ink">
                        {review.author} · Verified Buyer
                      </h3>
                      <p className="mt-1 text-xs text-ink/40">
                        {review.location} · {review.date}
                      </p>
                    </div>
                    <StarRating rating={review.rating} size="xs" />
                  </div>
                  <p className="mt-4 text-sm leading-6 text-ink/60">
                    &quot;{review.text}&quot;
                  </p>
                </article>
              ))}
            </div>
          </div>
        </div>
      </section>

      {relatedProducts.length > 0 && (
        <section className="bg-[#FAF9F7] py-16 sm:py-20 lg:py-28">
          <div className="mx-auto max-w-[1400px] px-5 sm:px-6">
            <h2 className="text-3xl font-serif font-medium text-ink sm:text-4xl">
              You May Also Like
            </h2>
            <div className="mt-10 grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-4">
              {relatedProducts.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </div>
        </section>
      )}

      <div className="fixed inset-x-0 bottom-0 z-40 flex items-center gap-3 border-t border-ink/10 bg-white/95 px-4 py-3 backdrop-blur md:hidden">
        <div className="flex items-center rounded-full border border-ink/15">
          <button
            onClick={() => setQuantity(Math.max(1, quantity - 1))}
            className="flex h-11 w-9 items-center justify-center text-ink/60 hover:text-ink"
            aria-label="Decrease quantity"
          >
            <Minus className="h-4 w-4" />
          </button>
          <span className="w-7 text-center text-sm font-medium">{quantity}</span>
          <button
            onClick={() => setQuantity(quantity + 1)}
            className="flex h-11 w-9 items-center justify-center text-ink/60 hover:text-ink"
            aria-label="Increase quantity"
          >
            <Plus className="h-4 w-4" />
          </button>
        </div>
        <button
          onClick={() => addToCart()}
          disabled={product.stock === 0}
          className="flex h-11 flex-1 items-center justify-center gap-2 rounded-full bg-ink text-sm font-semibold text-white transition-colors hover:bg-accent disabled:cursor-not-allowed disabled:bg-neutral-200 disabled:text-neutral-500"
        >
          <ShoppingBag className="h-4 w-4" />
          Add
        </button>
        <button
          onClick={handleBuyNow}
          disabled={product.stock === 0}
          className="flex h-11 flex-1 items-center justify-center gap-2 rounded-full bg-accent text-sm font-semibold text-white transition-colors hover:bg-accent-dark disabled:cursor-not-allowed disabled:bg-neutral-200 disabled:text-neutral-500"
        >
          <Zap className="h-4 w-4" />
          Buy Now
        </button>
      </div>

      {lightboxOpen && (
        <div
          className="fixed inset-0 z-[96] flex items-center justify-center bg-black/95 p-4"
          onClick={() => setLightboxOpen(false)}
        >
          <button
            onClick={() => setLightboxOpen(false)}
            className="absolute right-5 top-5 rounded-full bg-white/10 p-2 text-white transition-colors hover:bg-white/20"
            aria-label="Close zoom"
          >
            <X className="h-6 w-6" />
          </button>
          <div className="relative h-full max-h-[85vh] w-full max-w-3xl">
            <Image
              src={images[selectedImage]}
              alt={product.name}
              fill
              className="object-contain"
              sizes="(max-width: 768px) 100vw, 48rem"
            />
          </div>
        </div>
      )}
    </div>
  );
}
