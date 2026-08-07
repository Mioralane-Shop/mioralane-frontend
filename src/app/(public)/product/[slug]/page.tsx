"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  Star,
  Minus,
  Plus,
  ShoppingBag,
  Heart,
  Truck,
  Shield,
  RotateCcw,
  ChevronRight,
  X,
  Zap,
  ZoomIn,
} from "lucide-react";
import { useProduct } from "@/hooks/use-products";
import { useCartStore } from "@/store/cart.store";
import { useToastStore } from "@/store/toast.store";
import { Skeleton } from "@/components/ui/skeleton";
import { ProductCard } from "@/components/product/product-card";
import { DUMMY_PRODUCTS } from "@/constants/site";
import type { SizeOption } from "@/types/product";

const PAYMENT_METHODS = ["bKash", "Nagad", "Rocket", "COD", "SSLCommerz"];

const SAMPLE_REVIEWS = [
  {
    author: "Nusrat J.",
    location: "Dhaka",
    rating: 5,
    date: "2 weeks ago",
    text: "Absolutely love this! Delivery was fast and the product is 100% authentic. My skin has never felt better.",
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

const TABS = [
  { id: "description", label: "Description" },
  { id: "ingredients", label: "Ingredients" },
  { id: "howto", label: "How to Use" },
  { id: "reviews", label: "Reviews" },
  { id: "shipping", label: "Shipping & Returns" },
] as const;

type TabId = (typeof TABS)[number]["id"];

export default function ProductPage() {
  const { slug } = useParams<{ slug: string }>();
  const router = useRouter();
  const { data: product, isLoading } = useProduct(slug);
  const { addItem } = useCartStore();
  const addToast = useToastStore((s) => s.addToast);
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedSize, setSelectedSize] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<TabId>("description");

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
        <Link
          href="/shop"
          className="mt-4 inline-block text-sm font-medium text-accent hover:underline"
        >
          Back to Shop
        </Link>
      </div>
    );
  }

  const ritualProducts = [
    ...DUMMY_PRODUCTS.filter(
      (p) => p.category === product.category && p.id !== product.id,
    ),
    ...DUMMY_PRODUCTS.filter(
      (p) =>
        p.category !== product.category &&
        p.id !== product.id &&
        p.category !== "combo" &&
        p.category !== "sets",
    ),
  ].slice(0, 4);

  const relatedProducts = DUMMY_PRODUCTS.filter(
    (p) =>
      p.id !== product.id && p.category !== "combo" && p.category !== "sets",
  ).slice(0, 4);

  return (
    <div className="mx-auto max-w-[1400px] px-6 py-8 pb-28 md:pb-8">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-ink/50 mb-8">
        <Link href="/" className="hover:text-ink transition-colors">
          Home
        </Link>
        <ChevronRight className="h-3 w-3" />
        <Link href="/shop" className="hover:text-ink transition-colors">
          Shop
        </Link>
        <ChevronRight className="h-3 w-3" />
        <span className="text-ink">{product.name}</span>
      </nav>

      <div className="grid gap-8 md:grid-cols-2">
        {/* Gallery */}
        <div className="flex flex-col gap-4">
          <button
            onClick={() => setLightboxOpen(true)}
            className="group relative aspect-square overflow-hidden rounded-2xl bg-ink/[0.03]"
            aria-label="Zoom image"
          >
            <Image
              src={product.images[selectedImage]}
              alt={product.name}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-[1.02]"
              sizes="(max-width: 768px) 100vw, 50vw"
              priority
            />
            <span className="absolute bottom-4 right-4 flex h-9 w-9 items-center justify-center rounded-full bg-white/80 text-ink/70 shadow-md backdrop-blur transition-colors group-hover:text-ink">
              <ZoomIn className="h-4 w-4" />
            </span>
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
          </button>

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
            <span className="text-sm font-medium text-ink">
              {product.rating}
            </span>
            <span className="text-sm text-ink/40">
              ({product.reviewCount} reviews)
            </span>
          </div>

          {/* Price */}
          <div className="flex items-baseline gap-3">
            <span className="text-3xl font-bold text-ink">
              ৳{displayPrice.toLocaleString()}
            </span>
            {compareAtPrice && compareAtPrice > displayPrice && (
              <span className="text-lg text-ink/40 line-through">
                ৳{compareAtPrice.toLocaleString()}
              </span>
            )}
            {product.krw && (
              <span className="text-sm text-ink/40">{product.krw}</span>
            )}
          </div>

          {/* Description */}
          <p className="text-ink/60 leading-relaxed font-light">
            {product.longDescription || product.description}
          </p>

          {/* Size selector */}
          {sizeOptions.length > 1 && (
            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-ink/40">
                Select Size
              </p>
              <div className="flex flex-wrap gap-2">
                {sizeOptions.map((opt, i) => (
                  <button
                    key={`${opt.label}-${i}`}
                    onClick={() => setSelectedSize(i)}
                    className={`rounded-xl border px-4 py-2.5 text-left transition-all ${
                      selectedSize === i
                        ? "border-ink bg-ink text-white"
                        : "border-ink/15 bg-white hover:border-ink/40"
                    }`}
                  >
                    <span className="block text-sm font-medium">
                      {opt.label}
                    </span>
                    <span
                      className={`block text-xs ${
                        selectedSize === i ? "text-white/70" : "text-ink/40"
                      }`}
                    >
                      ৳{opt.price.toLocaleString()}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

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
                <p className="text-sm font-medium text-ink">
                  {product.skinType}
                </p>
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
                    <span
                      key={c}
                      className="px-2 py-0.5 bg-ink/[0.04] rounded text-xs text-ink/60"
                    >
                      {c}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Quantity + actions */}
          <div className="flex items-center gap-3">
            <div className="flex items-center rounded-full border border-ink/15">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="w-10 h-10 flex items-center justify-center text-ink/60 hover:text-ink transition-colors"
              >
                <Minus className="h-4 w-4" />
              </button>
              <span className="w-10 text-center text-sm font-medium">
                {quantity}
              </span>
              <button
                onClick={() => setQuantity(quantity + 1)}
                className="w-10 h-10 flex items-center justify-center text-ink/60 hover:text-ink transition-colors"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>

            <button
              onClick={() => addToCart()}
              className="flex-1 flex items-center justify-center gap-2 h-12 bg-ink text-white rounded-full font-semibold text-sm hover:bg-accent transition-colors"
            >
              <ShoppingBag className="h-5 w-5" />
              Add to Cart
            </button>

            <button className="w-12 h-12 flex items-center justify-center rounded-full border border-ink/15 text-ink/60 hover:text-ink hover:border-ink/30 transition-all">
              <Heart className="h-5 w-5" />
            </button>
          </div>

          {/* Buy Now */}
          <button
            onClick={handleBuyNow}
            className="flex items-center justify-center gap-2 h-12 w-full rounded-full bg-accent text-white font-semibold text-sm hover:bg-accent-dark transition-colors"
          >
            <Zap className="h-5 w-5" />
            Buy Now
          </button>

          {/* Stock */}
          {product.stock <= 5 && product.stock > 0 && (
            <p className="text-sm text-amber-600 font-medium">
              Only {product.stock} left in stock — order soon!
            </p>
          )}
          {product.stock === 0 && (
            <p className="text-sm text-red-500 font-medium">Out of stock</p>
          )}

          {/* Payment badges */}
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-ink/40">
              We Accept
            </p>
            <div className="flex flex-wrap gap-2">
              {PAYMENT_METHODS.map((method) => (
                <span
                  key={method}
                  className="rounded-lg border border-ink/10 bg-white px-3 py-1.5 text-xs font-semibold text-ink/70"
                >
                  {method}
                </span>
              ))}
            </div>
          </div>

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

      {/* Tabbed content */}
      <div className="mt-12 pt-10 border-t border-ink/10">
        <div className="flex gap-2 overflow-x-auto border-b border-ink/10">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-shrink-0 border-b-2 px-4 py-3 text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? "border-ink text-ink"
                  : "border-transparent text-ink/50 hover:text-ink"
              }`}
            >
              {tab.label}
              {tab.id === "reviews" && ` (${product.reviewCount})`}
            </button>
          ))}
        </div>

        <div className="py-8">
          {activeTab === "description" && (
            <div className="max-w-3xl">
              <p className="text-ink/60 leading-relaxed font-light">
                {product.longDescription || product.description}
              </p>
            </div>
          )}

          {activeTab === "ingredients" && (
            <div className="max-w-3xl">
              <p className="text-ink/60 leading-relaxed font-light">
                {product.ingredients ||
                  "Full ingredient list available on request. All products are 100% authentic and batch-verified."}
              </p>
            </div>
          )}

          {activeTab === "howto" && (
            <div className="max-w-3xl">
              <p className="text-ink/60 leading-relaxed font-light">
                {product.howToUse ||
                  "Apply a small amount to clean, dry skin and gently pat until fully absorbed. Use as part of your daily routine, morning and/or evening."}
              </p>
            </div>
          )}

          {activeTab === "reviews" && (
            <div className="max-w-3xl">
              <div className="mb-6 flex items-center gap-4">
                <div className="text-center">
                  <p className="text-4xl font-bold text-ink">
                    {product.rating}
                  </p>
                  <div className="mt-1 flex items-center justify-center gap-0.5">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className={`h-3.5 w-3.5 ${
                          i < Math.floor(product.rating)
                            ? "fill-amber-400 text-amber-400"
                            : "text-ink/15"
                        }`}
                      />
                    ))}
                  </div>
                  <p className="mt-1 text-xs text-ink/40">
                    {product.reviewCount} reviews
                  </p>
                </div>
              </div>
              <div className="space-y-5">
                {SAMPLE_REVIEWS.map((r) => (
                  <div
                    key={r.author}
                    className="border-b border-ink/5 pb-5 last:border-0"
                  >
                    <div className="mb-1.5 flex items-center justify-between">
                      <div>
                        <p className="text-sm font-semibold text-ink">
                          {r.author}
                        </p>
                        <p className="text-xs text-ink/40">
                          {r.location} · {r.date}
                        </p>
                      </div>
                      <div className="flex items-center gap-0.5">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star
                            key={i}
                            className={`h-3 w-3 ${
                              i < r.rating
                                ? "fill-amber-400 text-amber-400"
                                : "text-ink/15"
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                    <p className="text-sm leading-relaxed text-ink/60">
                      {r.text}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === "shipping" && (
            <div className="max-w-3xl space-y-5">
              <div>
                <h4 className="mb-1 text-sm font-semibold text-ink">
                  Delivery
                </h4>
                <p className="text-sm leading-relaxed text-ink/60">
                  Free delivery on orders over ৳2,000 within Dhaka. Nationwide
                  delivery available via courier (2–4 business days outside
                  Dhaka). Cash on Delivery available.
                </p>
              </div>
              <div>
                <h4 className="mb-1 text-sm font-semibold text-ink">Returns</h4>
                <p className="text-sm leading-relaxed text-ink/60">
                  Easy returns within 7 days of delivery. Products must be
                  unopened and in original packaging. Contact us to initiate a
                  return.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Complete the Ritual upsell */}
      {ritualProducts.length > 0 && (
        <div className="mt-12 pt-10 border-t border-ink/10">
          <h2 className="text-2xl font-serif font-medium text-ink mb-3">
            Complete the Ritual
          </h2>
          <p className="mb-8 text-sm text-ink/50">
            Step up your routine with these complementary essentials
          </p>
          <div className="grid grid-cols-2 gap-6 lg:grid-cols-4">
            {ritualProducts.map((p) => (
              <div
                key={p.id}
                className="flex flex-col rounded-2xl border border-ink/10 bg-white p-4"
              >
                <Link
                  href={`/product/${p.slug}`}
                  className="relative aspect-square overflow-hidden rounded-xl bg-ink/[0.03]"
                >
                  <Image
                    src={p.images[0]}
                    alt={p.name}
                    fill
                    className="object-cover"
                    sizes="(max-width: 640px) 50vw, 25vw"
                  />
                </Link>
                <div className="mt-3 flex-1">
                  <p className="text-[11px] font-medium uppercase tracking-wider text-ink/40">
                    {p.brand}
                  </p>
                  <Link
                    href={`/product/${p.slug}`}
                    className="mt-0.5 block text-sm font-medium text-ink hover:text-accent transition-colors"
                  >
                    {p.name}
                  </Link>
                  <p className="mt-1 text-sm font-semibold text-ink">
                    ৳{p.price.toLocaleString()}
                  </p>
                </div>
                <button
                  onClick={() => {
                    addItem(p, 1);
                    addToast(`${p.name} added to cart`);
                  }}
                  className="mt-3 w-full rounded-full border border-ink/15 py-2 text-sm font-medium text-ink transition-colors hover:border-ink hover:bg-ink hover:text-white"
                >
                  Add to Ritual
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Related Products */}
      <div className="mt-12 pt-10 border-t border-ink/10">
        <h2 className="text-2xl font-serif font-medium text-ink mb-8">
          You May Also Like
        </h2>
        <div className="grid grid-cols-2 gap-6 lg:grid-cols-4">
          {relatedProducts.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </div>

      {/* Mobile sticky add-to-cart bar */}
      <div className="fixed inset-x-0 bottom-0 z-40 flex items-center gap-3 border-t border-ink/10 bg-white/95 px-4 py-3 backdrop-blur md:hidden">
        <div className="flex items-center rounded-full border border-ink/15">
          <button
            onClick={() => setQuantity(Math.max(1, quantity - 1))}
            className="flex h-11 w-9 items-center justify-center text-ink/60 hover:text-ink"
            aria-label="Decrease quantity"
          >
            <Minus className="h-4 w-4" />
          </button>
          <span className="w-7 text-center text-sm font-medium">
            {quantity}
          </span>
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
          className="flex h-11 flex-1 items-center justify-center gap-2 rounded-full bg-ink text-sm font-semibold text-white transition-colors hover:bg-accent"
        >
          <ShoppingBag className="h-4 w-4" />
          Add to Cart
        </button>
        <button
          onClick={handleBuyNow}
          className="flex h-11 flex-1 items-center justify-center gap-2 rounded-full bg-accent text-sm font-semibold text-white transition-colors hover:bg-accent-dark"
        >
          <Zap className="h-4 w-4" />
          Buy Now
        </button>
      </div>

      {/* Lightbox (image zoom) */}
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
              src={product.images[selectedImage]}
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
