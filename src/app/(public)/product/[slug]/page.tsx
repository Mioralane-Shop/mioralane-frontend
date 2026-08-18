"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowRight,
  ChevronRight,
  ChevronLeft,
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
} from "lucide-react";
import { useProduct } from "@/hooks/use-products";
import { useCartStore } from "@/store/cart.store";
import { useToastStore } from "@/store/toast.store";
import { useWishlistStore } from "@/store/wishlist.store";
import { useAuthStore } from "@/store/auth.store";
import { Skeleton } from "@/components/ui/skeleton";
import { DUMMY_PRODUCTS } from "@/constants/site";
import { cn, formatPrice } from "@/lib/utils";
import type { Product, SizeOption } from "@/types/product";

type ProductTab = "overview" | "ingredients" | "shipping" | "reviews";

const PRODUCT_TABS: Array<{ key: ProductTab; label: string }> = [
  { key: "overview", label: "Overview" },
  { key: "ingredients", label: "Ingredients" },
  { key: "shipping", label: "Shipping & Returns" },
  { key: "reviews", label: "Reviews" },
];

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

function getBestForChips(product: Product) {
  const tokens = [
    ...(product.skinType ? splitValues(product.skinType) : []),
    ...(product.concerns ?? []),
    ...(product.tags ?? []),
  ]
    .map((value) => formatCategory(value))
    .filter(Boolean);
  return Array.from(new Set(tokens)).slice(0, 6);
}

function getRoutineStepLabel(product: Product) {
  const step = getRoutineStep(product);
  const index = ROUTINE_STEPS.findIndex((item) => item.id === step.id) + 1;
  return `${String(index).padStart(2, "0")} Ã‚Â· ${step.label.toUpperCase()}`;
}

function getUsageWindow(product: Product) {
  const text = `${product.name} ${product.description} ${product.longDescription ?? ""}`.toLowerCase();
  if (text.includes("spf") || text.includes("sunscreen") || text.includes("sun care")) {
    return { am: true, pm: false };
  }
  return { am: true, pm: true };
}

function getProductFeaturePoints(product: Product) {
  const text = `${product.name} ${product.description} ${product.longDescription ?? ""}`.toLowerCase();
  const points = [
    {
      title: "Deep Hydration",
      text: "Replenishes moisture and helps keep skin comfortable.",
      match: /hydrat|moistur|plump|water|serum|essence|ampoule|hyalur/i,
    },
    {
      title: "Barrier Support",
      text: "Supports a healthier-looking barrier and softer feel.",
      match: /barrier|repair|panthenol|ceramide|centella|cica|sooth|calm/i,
    },
    {
      title: "Brightening",
      text: "Helps improve the look of dullness and uneven tone.",
      match: /bright|glow|niacinamide|vitamin c|txa|spot|tone/i,
    },
    {
      title: "Daily Protection",
      text: "Designed for easy layering and comfortable everyday wear.",
      match: /sun|spf|uv|sunscreen|protection|lightweight|no white cast/i,
    },
  ];

  return points.filter((point) => point.match.test(text)).slice(0, 4);
}

function getHowToUseSteps(product: Product) {
  if (product.howToUse) {
    return product.howToUse
      .split(/[\n.]+/)
      .map((step) => step.trim())
      .filter(Boolean)
      .slice(0, 3);
  }

  const stepLabel = getRoutineStepLabel(product).slice(5).toLowerCase();
  const base = [
    "Apply after cleansing and toning.",
    "Use a small amount and pat until absorbed.",
    "Follow with moisturizer and SPF during the day.",
  ];

  if (stepLabel.includes("cleanse")) {
    return [
      "Massage onto dry or damp skin as the first step.",
      "Emulsify gently, then rinse thoroughly.",
      "Continue with toner or the next treatment step.",
    ];
  }

  if (stepLabel.includes("tone")) {
    return [
      "Apply after cleansing with hands or cotton pad.",
      "Layer gently to prep the skin for treatment.",
      "Follow with serum or moisturizer.",
    ];
  }

  if (stepLabel.includes("treat")) {
    return [
      "After cleansing and toning, apply 2-3 drops or a small amount.",
      "Pat gently into the skin until absorbed.",
      "Seal with moisturizer and SPF in the morning.",
    ];
  }

  if (stepLabel.includes("moisturize")) {
    return [
      "Use as the final hydration step after treatment products.",
      "Massage evenly across face and neck.",
      "Apply more on dry areas when needed.",
    ];
  }

  if (stepLabel.includes("protect")) {
    return [
      "Apply generously as the final morning skincare step.",
      "Reapply throughout the day as needed.",
      "Use after moisturizer for consistent protection.",
    ];
  }

  return base;
}

function getIngredientHighlights(product: Product) {
  const text = `${product.name} ${product.description} ${product.longDescription ?? ""}`.toLowerCase();
  const highlights = [
    {
      name: "Hyaluronic Acid",
      meta: "Deep Hydration Ã‚Â· Plumping",
      match: /hyalur|ha\b|water-fit|moistur/i,
    },
    {
      name: "Centella Asiatica",
      meta: "Calming Ã‚Â· Sensitive Skin Friendly",
      match: /centella|cica|sooth|calm/i,
    },
    {
      name: "Niacinamide",
      meta: "Brightening Ã‚Â· Tone Support",
      match: /niacinamide|bright|glow|spot|tone/i,
    },
    {
      name: "Panthenol",
      meta: "Barrier Support Ã‚Â· Comfort",
      match: /panthenol|barrier|repair/i,
    },
    {
      name: "Snail Mucin",
      meta: "Repair Ã‚Â· Recovery",
      match: /snail/i,
    },
    {
      name: "Propolis",
      meta: "Glow Ã‚Â· Support",
      match: /propolis/i,
    },
    {
      name: "Ceramide",
      meta: "Barrier Support Ã‚Â· Moisture",
      match: /ceramide/i,
    },
    {
      name: "Tea Tree / BHA",
      meta: "Clarifying Ã‚Â· Oil Control",
      match: /bha|tea tree|acne|oil/i,
    },
    {
      name: "Vitamin C",
      meta: "Brightening Ã‚Â· Radiance",
      match: /vitamin c|ascorb|c-vit/i,
    },
    {
      name: "SPF Filters",
      meta: "UV Protection Ã‚Â· Daily Wear",
      match: /spf|uv|sunscreen|sun/i,
    },
  ];

  return highlights.filter((item) => item.match.test(text)).slice(0, 4);
}

function getShippingNotes(product: Product) {
  const source = product.source?.toLowerCase() ?? "";
  const authenticity = source
    ? `Sourced through verified suppliers and trusted distribution channels, including ${product.source}.`
    : "Sourced through verified suppliers and trusted distribution channels.";

  return {
    delivery: [
      { label: "Inside Dhaka", value: "1-2 Business Days" },
      { label: "Outside Dhaka", value: "2-4 Business Days" },
      { label: "Free Delivery", value: "Orders over Ã Â§Â³2,000" },
    ],
    returns:
      "Unused and unopened products may be returned within 7 days of delivery, subject to inspection.",
    authenticity,
  };
}

function getBenefitStatement(product: Product) {
  const source = product.description || product.longDescription;
  if (!source) return "Targeted Korean skincare selected for a balanced, healthy-looking routine.";
  return source.length > 118 ? `${source.slice(0, 115).trim()}...` : source;
}

function getTexture(product: Product) {
  const text = `${product.name} ${product.description} ${product.longDescription ?? ""}`.toLowerCase();
  if (text.includes("gel")) return "Gel Ã‚Â· Fresh";
  if (text.includes("cream") || text.includes("rich")) return "Cream Ã‚Â· Comforting";
  if (text.includes("oil")) return "Silky oil Ã‚Â· Rinses clean";
  if (text.includes("lightweight") || text.includes("serum") || text.includes("ampoule")) {
    return "Lightweight Ã‚Â· Fast absorbing";
  }
  return "";
}

function getFinish(product: Product) {
  const text = `${product.description} ${product.longDescription ?? ""}`.toLowerCase();
  if (text.includes("no white cast")) return "No white cast Ã‚Â· Natural";
  if (text.includes("non-greasy") || text.includes("non greasy")) return "Fresh Ã‚Â· Non-greasy";
  if (text.includes("glow") || text.includes("plump")) return "Healthy glow Ã‚Â· Plump";
  return "";
}

function clampQuantityToStock(quantity: number, stock: number) {
  if (stock <= 0) {
    return 1;
  }

  return Math.max(1, Math.min(quantity, stock));
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
  const [activeTab, setActiveTab] = useState<ProductTab>("overview");
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const mobileGalleryRef = useRef<HTMLDivElement>(null);
  const syncItemStock = useCartStore((s) => s.syncItemStock);

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
  const effectiveStock = selectedSizeOption?.stock ?? product?.stock ?? 0;

  useEffect(() => {
    if (!product) return;

    setQuantity((current) => clampQuantityToStock(current, effectiveStock));
    syncItemStock(product.id, effectiveStock);
  }, [effectiveStock, product, syncItemStock]);

  const addToCart = (qty: number = quantity) => {
    if (!product || effectiveStock <= 0) return;

    const quantityToAdd = clampQuantityToStock(qty, effectiveStock);
    addItem(
      {
        ...product,
        price: displayPrice,
        compareAtPrice,
      },
      quantityToAdd,
    );
    addToast(`${product.name} added to cart`);
    setQuantity(1);
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
  const benefitChips = getBenefitChips(product);
  const routineProducts = getRoutineProducts(product);
  const stockText =
    effectiveStock > 0
      ? `In Stock · ${effectiveStock <= 20 ? `Only ${effectiveStock} left` : "Ready to ship"}`
      : "Out of stock";
  const discountPercent =
    compareAtPrice && compareAtPrice > displayPrice
      ? Math.round(((compareAtPrice - displayPrice) / compareAtPrice) * 100)
      : 0;
  const selectedSizeLabel =
    selectedSizeOption?.volume ||
    product.volume ||
    product.size ||
    (sizeOptions.length > 1 ? selectedSizeOption?.label : "");
  const showSizeSelector = sizeOptions.length > 1 || Boolean(selectedSizeLabel);
  const goToImage = (offset: number) => {
    if (images.length === 0) return;
    setSelectedImage((current) => (current + offset + images.length) % images.length);
  };
  const bestForChips = getBestForChips(product);
  const featurePoints = getProductFeaturePoints(product);
  const howToUseSteps = getHowToUseSteps(product);
  const usageWindow = getUsageWindow(product);
  const ingredientHighlights = getIngredientHighlights(product);
  const shippingNotes = getShippingNotes(product);

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

        <section className="grid gap-9 lg:grid-cols-[minmax(0,1.12fr)_minmax(360px,0.88fr)] lg:items-start lg:gap-12">
          <div className="lg:sticky lg:top-24 lg:self-start">
            <div className="hidden md:flex md:items-start md:gap-4">
              {images.length > 1 && (
                <div className="max-h-[calc((5.75rem*4)+(0.75rem*3))] w-24 shrink-0 space-y-3 overflow-y-auto pr-1">
                  {images.map((image, index) => (
                    <button
                      key={image + index}
                      onClick={() => setSelectedImage(index)}
                      className={cn(
                        "relative aspect-square overflow-hidden rounded-xl bg-[#F7F8F4] transition-all",
                        selectedImage === index
                          ? "ring-1 ring-ink/25 opacity-100"
                          : "opacity-75 hover:opacity-100",
                      )}
                      aria-label={`View image ${index + 1}`}
                    >
                      <Image
                        src={image}
                        alt={`${product.name} thumbnail ${index + 1}`}
                        fill
                        className="object-contain p-2"
                        sizes="96px"
                      />
                    </button>
                  ))}
                </div>
              )}

              <div
                role="button"
                tabIndex={0}
                onClick={() => setLightboxOpen(true)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    setLightboxOpen(true);
                  }
                }}
                className="group relative aspect-square flex-1 overflow-hidden rounded-2xl bg-[#F7F8F4]"
                aria-label="Zoom product image"
              >
                {(product.isBestSeller || product.tag === "best" || product.isNew || product.tag === "new") && (
                  <span className="absolute left-5 top-5 z-10 rounded-full border border-ink/25 bg-white/80 px-4 py-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-ink/65 backdrop-blur">
                    {product.isNew || product.tag === "new" ? "New Arrival" : "Best Seller"}
                  </span>
                )}
                {images.length > 1 && (
                  <>
                    <button
                      type="button"
                      onClick={(event) => {
                        event.stopPropagation();
                        goToImage(-1);
                      }}
                      className="absolute left-4 top-1/2 z-10 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white text-ink/60 shadow-sm transition-colors hover:text-ink"
                      aria-label="Previous image"
                    >
                      <ChevronLeft className="h-5 w-5" />
                    </button>
                    <button
                      type="button"
                      onClick={(event) => {
                        event.stopPropagation();
                        goToImage(1);
                      }}
                      className="absolute right-4 top-1/2 z-10 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white text-ink/60 shadow-sm transition-colors hover:text-ink"
                      aria-label="Next image"
                    >
                      <ArrowRight className="h-5 w-5" />
                    </button>
                  </>
                )}
                <Image
                  src={images[selectedImage]}
                  alt={product.name}
                  fill
                  className="object-contain transition-transform duration-500 group-hover:scale-[1.02]"
                  sizes="(max-width: 1024px) 100vw, 48vw"
                  priority
                />
                <div className="absolute inset-x-0 bottom-4 flex items-center justify-center gap-1.5 px-4">
                  {images.map((_, index) => (
                    <button
                      key={index}
                      onClick={(event) => {
                        event.stopPropagation();
                        setSelectedImage(index);
                      }}
                      className={cn(
                        "h-1.5 rounded-full transition-all",
                        selectedImage === index ? "w-8 bg-ink" : "w-5 bg-ink/15 hover:bg-ink/25",
                      )}
                      aria-label={`Select image ${index + 1}`}
                    />
                  ))}
                </div>
              </div>
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
                    className="relative aspect-square w-full min-w-full snap-center overflow-hidden rounded-2xl bg-[#F7F8F4]"
                    aria-label={`Open image ${index + 1}`}
                  >
                    <Image
                      src={image}
                      alt={`${product.name} image ${index + 1}`}
                      fill
                      className="object-contain p-8"
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
                      selectedImage === index ? "w-6 bg-ink" : "w-2.5 bg-ink/20",
                    )}
                    aria-label={`Select image ${index + 1}`}
                  />
                ))}
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-5 lg:pt-1">
            <div>
              {product.brand && (
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-ink/45">
                  {product.brand}
                </p>
              )}
              <h1 className="mt-2 max-w-xl text-4xl font-serif font-medium leading-[1.05] text-ink sm:text-5xl">
                {product.name}
              </h1>
              <div className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-2 text-sm text-ink/55">
                <StarRating rating={product.rating} />
                <span>{product.rating.toFixed(1)} Ã‚Â· {product.reviewCount} Reviews</span>
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
                {discountPercent > 0 && (
                  <span className="rounded-full bg-[#EEF3CF] px-2.5 py-1 text-[11px] font-bold text-ink/60">
                    {discountPercent}%
                  </span>
                )}
                {product.krw && <span className="text-sm text-ink/35">{product.krw}</span>}
              </div>
              <p
                className={cn(
                  "mt-2 text-xs font-medium",
                  product.stock > 0 ? "text-success" : "text-red-500",
                )}
              >
                {stockText}
              </p>
            </div>

            <div className="space-y-4">
              <p className="max-w-xl text-sm leading-7 text-ink/60">
                {getBenefitStatement(product)}
              </p>
              {benefitChips.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {benefitChips.map((chip) => (
                    <span
                      key={chip}
                      className="rounded-full border border-ink/10 bg-white px-3.5 py-2 text-xs font-medium text-ink/65"
                    >
                      {chip}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {showSizeSelector && (
              <div>
                <p className="mb-3 text-xs font-semibold text-ink">
                  Size:
                </p>
                <div className="grid grid-cols-2 gap-2">
                  {sizeOptions.length > 1 ? (
                    sizeOptions.map((opt, i) => (
                      <button
                        key={`${opt.label}-${i}`}
                        onClick={() => setSelectedSize(i)}
                        className={cn(
                          "min-h-11 rounded-full border px-4 text-center text-sm font-semibold transition-all",
                          selectedSize === i
                            ? "border-[#B7C36A] bg-[#EEF3CF] text-ink"
                            : "border-ink/10 bg-[#F7F8F4] text-ink/70 hover:border-ink/25",
                        )}
                      >
                        {opt.volume || opt.label}
                      </button>
                    ))
                  ) : (
                    <span className="inline-flex min-h-11 items-center justify-center rounded-full border border-[#B7C36A] bg-[#EEF3CF] px-4 text-center text-sm font-semibold text-ink">
                      {selectedSizeLabel}
                    </span>
                  )}
                </div>
              </div>
            )}

            <div className="space-y-5">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="flex h-11 shrink-0 items-center rounded-full border border-ink/25 bg-white">
                  <button
                    onClick={() => setQuantity((current) => clampQuantityToStock(current - 1, effectiveStock))}
                    disabled={quantity <= 1}
                    className="flex h-11 w-10 items-center justify-center text-ink/55 transition-colors hover:text-ink"
                    aria-label="Decrease quantity"
                  >
                    <Minus className="h-4 w-4" />
                  </button>
                  <span className="w-8 text-center text-sm font-semibold">{quantity}</span>
                  <button
                    onClick={() => setQuantity((current) => clampQuantityToStock(current + 1, effectiveStock))}
                    disabled={quantity >= effectiveStock || effectiveStock <= 0}
                    className="flex h-11 w-10 items-center justify-center text-ink/55 transition-colors hover:text-ink disabled:cursor-not-allowed disabled:text-neutral-300 disabled:hover:text-neutral-300"
                    aria-label="Increase quantity"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>

                <button
                  onClick={() => addToCart()}
                  disabled={effectiveStock === 0}
                  className={cn(
                    "flex h-11 flex-1 items-center justify-center gap-2 rounded-full text-sm font-semibold transition-colors",
                    effectiveStock === 0
                      ? "cursor-not-allowed bg-neutral-200 text-neutral-500"
                      : "bg-[#4B3858] text-white hover:bg-accent-dark",
                  )}
                >
                  <ShoppingBag className="h-4 w-4" />
                  Add to Cart Ã‚Â· {formatPrice(displayPrice)}
                </button>

                <button
                  onClick={handleWishlist}
                  disabled={isTogglingWishlist}
                  className={cn(
                    "flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-ink/25 bg-white transition-all hover:border-accent/50 hover:text-accent",
                    isWishlisted && "border-accent/25 bg-accent-pale text-accent",
                    isTogglingWishlist && "cursor-wait opacity-70",
                  )}
                  aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
                >
                  <Heart className={cn("h-5 w-5", isWishlisted && "fill-current")} />
                </button>
              </div>

              <p className="text-center text-xs text-ink/45">
                Secure checkout · bKash · Nagad · Rocket · COD
              </p>

              <div className="grid gap-3 border-t border-ink/10 pt-4 md:grid-cols-3 md:gap-4">
                {TRUST_ITEMS.map((item) => {
                  const Icon = item.icon;
                  return (
                    <div key={item.title} className="flex items-start gap-3">
                      <span className="mt-0.5 flex h-8 w-8 items-center justify-center rounded-full bg-[#FAF8F6] text-ink/70">
                        <Icon className="h-5 w-5" />
                      </span>
                      <div>
                        <h3 className="font-sans text-sm font-semibold text-ink">{item.title}</h3>
                        <p className="mt-1 text-sm text-ink/50">{item.text}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </section>

      </div>

            <section className="border-t border-ink/10 bg-white">
        <div className="mx-auto max-w-[1400px] px-5 sm:px-6">
          <div className="overflow-x-auto border-b border-ink/10">
            <div className="flex min-w-max gap-8">
              {PRODUCT_TABS.map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={cn(
                    "relative py-4 text-sm font-medium transition-colors",
                    activeTab === tab.key ? "text-ink" : "text-ink/45 hover:text-ink/75",
                  )}
                >
                  {tab.label}
                  {tab.key === "reviews" && ` (${product.reviewCount})`}
                  {activeTab === tab.key && (
                    <span className="absolute inset-x-0 bottom-0 h-px bg-accent" />
                  )}
                </button>
              ))}
            </div>
          </div>

          <div className="py-10 sm:py-12 lg:py-14">
            {activeTab === "overview" && (
              <div className="grid gap-8 lg:grid-cols-5 lg:gap-8">
                <section className="space-y-3 lg:pr-6">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-ink/35">
                    About
                  </p>
                  <p className="max-w-md text-sm leading-7 text-ink/65">
                    {product.longDescription || product.description}
                  </p>
                </section>

                <section className="space-y-3 lg:border-l lg:border-ink/10 lg:pl-6">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-ink/35">
                    Best For
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {bestForChips.length > 0 ? bestForChips.map((chip) => (
                      <span key={chip} className="rounded-full border border-ink/10 bg-[#FAF8F6] px-3 py-1.5 text-xs text-ink/65">{chip}</span>
                    )) : <span className="text-sm text-ink/45">All skin types</span>}
                  </div>
                </section>

                <section className="space-y-4 lg:border-l lg:border-ink/10 lg:pl-6">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-ink/35">
                    What It Does
                  </p>
                  <div className="space-y-4">
                    {featurePoints.length > 0 ? featurePoints.map((point, index) => {
                      const featureIcons = [Droplets, Sparkles, Feather, Shield];
                      const Icon = featureIcons[index % featureIcons.length];
                      return (
                        <div key={point.title} className={index > 0 ? "border-t border-ink/10 pt-4" : ""}>
                          <div className="flex items-center gap-2 text-sm font-semibold text-ink">
                            <Icon className="h-4 w-4 text-accent" />
                            {point.title}
                          </div>
                          <p className="mt-1 text-sm leading-6 text-ink/60">{point.text}</p>
                        </div>
                      );
                    }) : <p className="text-sm leading-6 text-ink/60">A targeted Korean skincare formula selected for everyday balance.</p>}
                  </div>
                </section>

                <section className="space-y-4 lg:border-l lg:border-ink/10 lg:pl-6">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-ink/35">
                    How To Use
                  </p>
                  <div className="space-y-4">
                    {howToUseSteps.map((step, index) => (
                      <div key={step} className={index > 0 ? "border-t border-ink/10 pt-4" : ""}>
                        <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-accent">
                          {String(index + 1).padStart(2, "0")}
                        </p>
                        <p className="mt-1 text-sm leading-6 text-ink/65">{step}</p>
                      </div>
                    ))}
                  </div>
                </section>

                <section className="space-y-4 lg:border-l lg:border-ink/10 lg:pl-6">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-ink/35">
                    When To Use
                  </p>
                  <div className="space-y-4">
                    <div className="flex items-center gap-4 text-sm font-medium">
                      <span className={usageWindow.am ? "text-ink" : "text-ink/25"}>AM ?</span>
                      <span className={usageWindow.pm ? "text-ink" : "text-ink/25"}>PM ?</span>
                    </div>
                    <div className="border-t border-ink/10 pt-4">
                      <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-ink/35">
                        Routine Step
                      </p>
                      <p className="mt-1 text-base font-semibold text-ink">{getRoutineStepLabel(product)}</p>
                    </div>
                  </div>
                </section>

                <section className="space-y-3 lg:border-l lg:border-ink/10 lg:pl-6">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-ink/35">
                    Quick Notes
                  </p>
                  <div className="space-y-2 text-sm leading-6 text-ink/60">
                    <p>{product.skinType || "All skin types"}</p>
                    <p>{product.concerns?.join(" Â· ") || "Balanced daily care"}</p>
                    <p>{getTexture(product) || getFinish(product) || "Lightweight and easy to layer"}</p>
                  </div>
                </section>
              </div>
            )}

            {activeTab === "ingredients" && (
              <div className="space-y-10">
                <div className="max-w-2xl">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-ink/35">Key Ingredients</p>
                </div>

                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                  {ingredientHighlights.length > 0 ? ingredientHighlights.map((ingredient) => (
                    <section key={ingredient.name} className="border-t border-ink/10 pt-4">
                      <h3 className="text-base font-semibold text-ink">{ingredient.name}</h3>
                      <p className="mt-1 text-sm text-ink/55">{ingredient.meta}</p>
                    </section>
                  )) : (
                    <p className="text-sm leading-7 text-ink/60">Ingredient details are not listed in the current catalog entry for this product.</p>
                  )}
                </div>

                <details className="border-t border-ink/10 pt-4">
                  <summary className="flex cursor-pointer list-none items-center justify-between text-sm font-medium text-ink">
                    <span>Full Ingredient List</span>
                    <span className="text-ink/35">+</span>
                  </summary>
                  <p className="mt-4 max-w-3xl text-sm leading-7 text-ink/60">{product.ingredients || "Full INCI ingredient list is not available in the current product data."}</p>
                </details>
              </div>
            )}

            {activeTab === "shipping" && (
              <div className="grid gap-10 lg:grid-cols-[1fr_1fr]">
                <section className="space-y-6">
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-ink/35">Delivery</p>
                    <div className="mt-4 space-y-4">
                      {shippingNotes.delivery.map((item) => (
                        <div key={item.label} className="flex items-center justify-between border-t border-ink/10 pt-3">
                          <span className="text-sm text-ink/60">{item.label}</span>
                          <span className="text-sm font-medium text-ink">{item.value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </section>

                <section className="space-y-6">
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-ink/35">Returns</p>
                    <p className="mt-4 max-w-xl text-sm leading-7 text-ink/60">{shippingNotes.returns}</p>
                  </div>
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-ink/35">Authenticity</p>
                    <p className="mt-4 max-w-xl text-sm leading-7 text-ink/60">{shippingNotes.authenticity}</p>
                  </div>
                </section>
              </div>
            )}

            {activeTab === "reviews" && (
              <div className="grid gap-10 lg:grid-cols-[0.85fr_1.15fr]">
                <div>
                  <p className="text-5xl font-semibold tracking-tight text-ink">{product.rating.toFixed(1)} / 5</p>
                  <div className="mt-3"><StarRating rating={product.rating} /></div>
                  <p className="mt-3 text-sm text-ink/50">Based on {product.reviewCount} reviews</p>
                  <div className="mt-6 space-y-2">
                    {[5, 4, 3, 2, 1].map((rating) => {
                      const width = rating === 5 ? "88%" : rating === 4 ? "24%" : rating === 3 ? "12%" : "3%";
                      return (
                        <div key={rating} className="flex items-center gap-3 text-xs text-ink/50">
                          <span className="w-8">{rating} ?</span>
                          <span className="h-1.5 flex-1 overflow-hidden rounded-full bg-white"><span className="block h-full rounded-full bg-gold" style={{ width }} /></span>
                        </div>
                      );
                    })}
                  </div>
                  <div className="mt-6 flex flex-wrap gap-2">
                    {["All", "5 Stars", "With Photos", "Dry Skin", "Sensitive Skin"].map((filter) => (
                      <button key={filter} className="rounded-full border border-ink/10 px-4 py-2 text-xs font-semibold text-ink/55 transition-colors hover:border-accent/30 hover:text-accent">{filter}</button>
                    ))}
                  </div>
                </div>

                <div className="space-y-4">
                  {SAMPLE_REVIEWS.map((review) => (
                    <article key={review.author} className="border-t border-ink/10 pt-4">
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div>
                          <h3 className="font-sans text-sm font-semibold text-ink">{review.author} Â· Verified Buyer</h3>
                          <p className="mt-1 text-xs text-ink/40">{review.location} Â· {review.date}</p>
                        </div>
                        <StarRating rating={review.rating} size="xs" />
                      </div>
                      <p className="mt-4 text-sm leading-6 text-ink/60">&quot;{review.text}&quot;</p>
                    </article>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      <section className="bg-[#FAF9F7] py-16 sm:py-20 lg:py-24">
        <div className="mx-auto max-w-[1400px] px-5 sm:px-6">
          <div className="max-w-2xl">
            <p className="text-xs font-bold uppercase tracking-[0.28em] text-accent">Routine Builder</p>
            <h2 className="mt-4 text-3xl font-serif font-medium text-ink sm:text-4xl">Complete the Ritual</h2>
            <p className="mt-4 text-sm leading-6 text-ink/55">Build a balanced skincare journey around the product you&apos;re viewing.</p>
          </div>
          <div className="mt-10 overflow-x-auto pb-2">
            <div className="flex min-w-[980px] gap-4">
              {routineProducts.map(({ step, product: routineProduct, isCurrent }, index) => (
                <div key={step.id} className={cn("relative flex w-56 shrink-0 flex-col rounded-[1.75rem] border bg-white p-4", isCurrent ? "border-accent" : "border-ink/10")}>
                  <p className="text-xs font-bold uppercase tracking-[0.22em] text-ink/35">{String(index + 1).padStart(2, "0")} {step.label}</p>
                  {routineProduct ? (
                    <>
                      <Link href={`/product/${routineProduct.slug}`} className="relative mt-4 aspect-square overflow-hidden rounded-2xl bg-[#FAF9F7]">
                        <Image src={routineProduct.images[0]} alt={routineProduct.name} fill className="object-cover" sizes="224px" />
                      </Link>
                      <div className="mt-4 flex-1">
                        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-accent">{routineProduct.brand}</p>
                        <Link href={`/product/${routineProduct.slug}`} className="mt-1 line-clamp-2 block font-sans text-sm font-semibold leading-5 text-ink transition-colors hover:text-accent">{routineProduct.name}</Link>
                        <p className="mt-2 text-sm font-semibold text-ink">{formatPrice(routineProduct.price)}</p>
                      </div>
                      {isCurrent ? (
                        <div className="mt-4 rounded-full bg-accent-pale px-3 py-2 text-center text-xs font-bold uppercase tracking-[0.16em] text-accent">You are here</div>
                      ) : (
                        <button onClick={() => { addItem(routineProduct, 1); addToast(`${routineProduct.name} added to cart`); }} className="mt-4 rounded-full border border-ink/15 py-2 text-sm font-medium text-ink transition-colors hover:border-ink hover:bg-ink hover:text-white">Add to Routine</button>
                      )}
                    </>
                  ) : (
                    <div className="mt-4 flex aspect-square items-center justify-center rounded-2xl bg-[#FAF9F7] text-center text-sm text-ink/35">No product selected</div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {relatedProducts.length > 0 && (
        <section className="bg-white py-16 sm:py-20 lg:py-24">
          <div className="mx-auto max-w-[1400px] px-5 sm:px-6">
            <h2 className="text-3xl font-serif font-medium text-ink sm:text-4xl">You May Also Like</h2>
            <div className="mt-10 grid grid-cols-2 gap-4 sm:gap-5 lg:grid-cols-4">
              {relatedProducts.map((p) => (
                <div key={p.id} className="flex flex-col">
                  <Link href={`/product/${p.slug}`} className="relative aspect-[4/5] overflow-hidden rounded-2xl bg-[#FAF9F7]"><Image src={p.images[0]} alt={p.name} fill className="object-cover" sizes="(max-width: 1024px) 50vw, 25vw" /></Link>
                  <div className="mt-3">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-ink/35">{p.brand}</p>
                    <Link href={`/product/${p.slug}`} className="mt-1 line-clamp-2 block text-sm font-semibold leading-5 text-ink transition-colors hover:text-accent">{p.name}</Link>
                    <div className="mt-2 flex items-center gap-2 text-sm text-ink/55"><Star className="h-3.5 w-3.5 fill-gold text-gold" /><span>{p.rating.toFixed(1)}</span></div>
                    <div className="mt-3 flex items-center justify-between gap-3"><span className="text-sm font-semibold text-ink">{formatPrice(p.price)}</span><button onClick={() => { addItem(p, 1); addToast(`${p.name} added to cart`); }} className="rounded-full border border-ink/15 px-3 py-1.5 text-xs font-medium text-ink transition-colors hover:border-ink hover:bg-ink hover:text-white">Add to Cart</button></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}      <div className="fixed inset-x-0 bottom-0 z-40 flex items-center gap-3 border-t border-ink/10 bg-white/95 px-4 py-3 backdrop-blur md:hidden">
        <div className="flex items-center rounded-full border border-ink/15">
          <button
            onClick={() => setQuantity((current) => clampQuantityToStock(current - 1, effectiveStock))}
            disabled={quantity <= 1}
            className="flex h-11 w-9 items-center justify-center text-ink/60 hover:text-ink"
            aria-label="Decrease quantity"
          >
            <Minus className="h-4 w-4" />
          </button>
          <span className="w-7 text-center text-sm font-medium">{quantity}</span>
          <button
            onClick={() => setQuantity((current) => clampQuantityToStock(current + 1, effectiveStock))}
            disabled={quantity >= effectiveStock || effectiveStock <= 0}
            className="flex h-11 w-9 items-center justify-center text-ink/60 hover:text-ink disabled:cursor-not-allowed disabled:text-neutral-300 disabled:hover:text-neutral-300"
            aria-label="Increase quantity"
          >
            <Plus className="h-4 w-4" />
          </button>
        </div>
        <button
          onClick={() => addToCart()}
          disabled={effectiveStock === 0}
          className="flex h-11 flex-1 items-center justify-center gap-2 rounded-full bg-[#4B3858] text-sm font-semibold text-white transition-colors hover:bg-accent disabled:cursor-not-allowed disabled:bg-neutral-200 disabled:text-neutral-500"
        >
          <ShoppingBag className="h-4 w-4" />
          Add to Cart
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


