"use client";

import { useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  AlertCircle,
  ChevronDown,
  ChevronRight,
  ChevronLeft,
  Heart,
  ImageIcon,
  Minus,
  Plus,
  RotateCcw,
  Shield,
  ShoppingBag,
  Truck,
  Loader2,
  Maximize2,
  X,
} from "lucide-react";
import { useProduct, useRelatedProducts } from "@/hooks/use-products";
import { useCartStore } from "@/store/cart.store";
import { useToastStore } from "@/store/toast.store";
import { useWishlistStore } from "@/store/wishlist.store";
import { useAuthStore } from "@/store/auth.store";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ProductReviews } from "@/components/product/product-reviews";
import { SITE_NAME } from "@/constants/site";
import { cn, formatPrice } from "@/lib/utils";
import {
  formatPreOrderDate,
  getProductAvailability,
  isPreOrderProduct,
} from "@/lib/pre-order";
import { firstRenderableImageSrc, isRenderableImageSrc } from "@/lib/safe-image-src";
import { productFullName } from "@/lib/product-name";
import type { Product, SizeOption } from "@/types/product";

type ProductTab = "overview" | "ingredients" | "shipping" | "reviews";

const PRODUCT_TABS: Array<{ key: Exclude<ProductTab, "reviews">; label: string }> = [
  { key: "overview", label: "Overview" },
  { key: "ingredients", label: "Ingredients" },
  { key: "shipping", label: "Shipping & Returns" },
];

const DESKTOP_THUMBNAIL_SLOTS = 4;

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

function getBenefitChips(product: Product) {
  const chips = [
    ...(product.tags ?? []),
    ...(product.concerns ?? []),
    ...(product.skinType ? splitValues(product.skinType) : []),
  ]
    .map((item) => formatCategory(item))
    .filter(Boolean);
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

function getShippingNotes(product: Product) {
  const source = product.source?.toLowerCase() ?? "";
  const authenticity = source
    ? `Sourced through verified suppliers and trusted distribution channels, including ${product.source}.`
    : "Sourced through verified suppliers and trusted distribution channels.";

  return {
    delivery: [
      { label: "Inside Dhaka", value: "1-2 Business Days" },
      { label: "Outside Dhaka", value: "2-4 Business Days" },
      { label: "Free Delivery", value: "Orders over ৳2,000" },
    ],
    returns:
      "Unused and unopened products may be returned within 7 days of delivery, subject to the store's return review.",
    authenticity,
  };
}

function getBenefitStatement(product: Product) {
  const source = product.description || product.longDescription;
  if (!source) return "Targeted Korean skincare selected for a balanced, healthy-looking routine.";
  return source;
}

/**
 * Where a description is long enough to be worth collapsing.
 *
 * Approximate on purpose. The clamp is what actually hides text; this only decides whether
 * the control is worth showing at all, and measuring the rendered height exactly would mean
 * a ref, an effect and a resize listener for a control that is cosmetic. Descriptions are
 * capped at 500 characters in the admin, so the longest ones run to roughly eight lines at
 * the width below, and previewing four of them is a real saving.
 */
const DESCRIPTION_PREVIEW_CHARS = 320;

function clampQuantityToStock(quantity: number, stock: number) {
  if (stock <= 0) {
    return 1;
  }

  return Math.max(1, Math.min(quantity, stock));
}

function getErrorStatus(error: unknown) {
  return (error as { response?: { status?: number } } | undefined)?.response?.status;
}

/**
 * Related-product thumbnail.
 *
 * `p.images[0]` is a stored URL, and `next/image`'s default loader **throws** for
 * a host absent from `images.remotePatterns` — which removes this page, not just
 * the thumbnail. `lib/safe-image-src.ts` has the guard and the reasoning.
 */
function RelatedThumb({ product }: { product: Product }) {
  const src = firstRenderableImageSrc(...(product.images ?? []), product.hoverImage);

  if (!src) {
    return <div className="absolute inset-0 bg-[#FAF9F7]" aria-hidden="true" />;
  }

  return (
    <Image
      src={src}
      alt={productFullName(product)}
      fill
      className="object-cover"
      sizes="(max-width: 1024px) 50vw, 25vw"
    />
  );
}

export default function ProductPage() {
  const { slug } = useParams<{ slug: string }>();
  const router = useRouter();
  const {
    data: product,
    isLoading,
    isError,
    error,
    refetch,
    isFetching,
  } = useProduct(slug);
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
  const [thumbnailStart, setThumbnailStart] = useState(0);
  const [selectedSize, setSelectedSize] = useState(0);
  const [activeTab, setActiveTab] = useState<ProductTab>("overview");
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);
  const mobileGalleryRef = useRef<HTMLDivElement>(null);
  const syncItemStock = useCartStore((s) => s.syncItemStock);
  const { data: relatedProducts = [] } = useRelatedProducts(
    product?.category ?? "",
    product?.id ?? ""
  );

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
  const productItemType = product?.itemType ?? (product?.category === "combo" ? "combo" : "product");
  const isPreOrder = isPreOrderProduct(product);
  const availability = product ? getProductAvailability(product) : null;
  const effectiveLimit = availability?.quantityLimit ?? effectiveStock;
  const canPurchase = availability?.isAvailable ?? false;

  useEffect(() => {
    if (!product) return;

    setQuantity((current) => clampQuantityToStock(current, effectiveLimit));
    if (!isPreOrder) {
      syncItemStock(product.id, effectiveStock, productItemType);
    }
  }, [effectiveLimit, effectiveStock, isPreOrder, product, productItemType, syncItemStock]);

  const addToCart = (qty: number = quantity) => {
    if (!product || !canPurchase) return;

    const quantityToAdd = clampQuantityToStock(qty, effectiveLimit);
    addItem(
      {
        ...product,
        price: displayPrice,
        compareAtPrice,
        itemType: productItemType,
      },
      quantityToAdd,
    );
    addToast(`${productFullName(product)} added to cart`);
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
        nextState ? `${productFullName(product)} added to wishlist` : "Removed from wishlist",
        "info",
      );
    } catch {
      addToast("Could not update wishlist. Please try again.", "error");
    }
  };

  const statusCode = getErrorStatus(error);
  const isNotFound = statusCode === 404 || statusCode === 400 || !slug;

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

  if (isError && isNotFound) {
    return (
      <div className="mx-auto max-w-[1400px] px-6 py-20 text-center">
        <h1 className="text-2xl font-display text-ink">Product Not Found</h1>
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

  if (isError) {
    return (
      <div className="mx-auto max-w-2xl px-6 py-20 text-center">
        <AlertCircle className="mx-auto h-16 w-16 text-rose-300" />
        <h1 className="mt-4 text-2xl font-light tracking-tight text-neutral-800 sm:text-3xl">
          Could not load product
        </h1>
        <p className="mt-3 text-neutral-400">
          We could not load this product right now. Please try again.
        </p>
        <div className="mt-6 flex justify-center gap-3">
          <Button onClick={() => refetch()} disabled={isFetching}>
            {isFetching ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Retrying...
              </>
            ) : (
              "Retry"
            )}
          </Button>
          <Button asChild variant="outline">
            <Link href="/shop">View Shop</Link>
          </Button>
        </div>
      </div>
    );
  }

  if (!product) {
    return null;
  }

  // Only URLs `next/image` can render: the default loader throws for a host that
  // is not in `images.remotePatterns`, and a throw here removes the whole page.
  const storedImages = (product.images ?? []).filter(isRenderableImageSrc);
  const images = storedImages.length
    ? storedImages
    : [product.hoverImage].filter(isRenderableImageSrc);
  const selectedImageSrc = images[selectedImage] ?? images[0];
  const mobileGalleryItems: Array<string | null> = images.length ? images : [null];
  const benefitChips = getBenefitChips(product);
  const descriptionText = getBenefitStatement(product);
  const isDescriptionLong = descriptionText.length > DESCRIPTION_PREVIEW_CHARS;
  const ingredients = (product.ingredients ?? "")
    .split(",")
    .map((ingredient) => ingredient.trim())
    .filter(Boolean);
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
    setSelectedImage((current) => {
      const next = (current + offset + images.length) % images.length;
      setThumbnailStart((start) => {
        if (next < start) return next;
        if (next >= start + DESKTOP_THUMBNAIL_SLOTS) {
          return Math.min(next - DESKTOP_THUMBNAIL_SLOTS + 1, Math.max(0, images.length - DESKTOP_THUMBNAIL_SLOTS));
        }
        return start;
      });
      return next;
    });
  };
  const bestForChips = getBestForChips(product);
  const shippingNotes = getShippingNotes(product);
  const maxThumbnailStart = Math.max(0, images.length - DESKTOP_THUMBNAIL_SLOTS);
  const visibleThumbnailStart = Math.min(thumbnailStart, maxThumbnailStart);
  const thumbnailSlots = Array.from({ length: DESKTOP_THUMBNAIL_SLOTS }, (_, index) => {
    const actualIndex = visibleThumbnailStart + index;
    return {
      actualIndex,
      image: images[actualIndex],
    };
  });
  const reviewTabLabel = `Reviews (${product.reviewCount ?? 0})`;

  return (
    <div className="bg-white pb-28 md:pb-0">
      <div className="mx-auto max-w-[1400px] px-5 py-6 sm:px-6 lg:py-8">
        <nav className="mb-6 flex items-center gap-2 text-[11px] text-ink/45">
          <Link href="/" className="transition-colors hover:text-ink">
            Home
          </Link>
          <ChevronRight className="h-3 w-3" />
          <Link href="/shop" className="transition-colors hover:text-ink">
            Shop
          </Link>
          <ChevronRight className="h-3 w-3" />
          <span className="line-clamp-1 normal-case tracking-normal text-ink/60">
            {productFullName(product)}
          </span>
        </nav>

        <section className="grid gap-8 border-border pb-8 lg:grid-cols-[minmax(0,1.04fr)_minmax(320px,0.96fr)] lg:items-start lg:gap-10 lg:pb-10 xl:grid-cols-[minmax(0,1.04fr)_minmax(360px,0.96fr)]">
          <div className="lg:sticky lg:top-24 lg:self-start">
            <div className="hidden md:flex md:items-start md:gap-4">
              <div className="flex w-[72px] shrink-0 flex-col items-center gap-3">
                {thumbnailSlots.map(({ image, actualIndex }) => (
                  image ? (
                    <button
                      key={image + actualIndex}
                      onClick={() => setSelectedImage(actualIndex)}
                      className={cn(
                        "relative aspect-square w-full overflow-hidden rounded-2xl border bg-[#F8F6F2] transition-all",
                        selectedImage === actualIndex
                          ? "border-accent bg-white"
                          : "border-border hover:border-ink/20",
                      )}
                      aria-label={`View image ${actualIndex + 1}`}
                    >
                      <Image
                        src={image}
                        alt={`${productFullName(product)} thumbnail ${actualIndex + 1}`}
                        fill
                        className="object-contain p-2.5"
                        sizes="72px"
                      />
                    </button>
                  ) : (
                    <div
                      key={`placeholder-${actualIndex}`}
                      className="flex aspect-square w-full items-center justify-center rounded-2xl border border-border bg-[#F8F6F2] text-ink/25"
                      aria-hidden="true"
                    >
                      <ImageIcon className="h-5 w-5" />
                    </div>
                  )
                ))}
                {images.length > DESKTOP_THUMBNAIL_SLOTS && (
                  <button
                    type="button"
                    onClick={() => {
                      setThumbnailStart((current) => {
                        const next = current >= maxThumbnailStart ? 0 : Math.min(current + 1, maxThumbnailStart);
                        if (selectedImage < next || selectedImage >= next + DESKTOP_THUMBNAIL_SLOTS) {
                          setSelectedImage(next);
                        }
                        return next;
                      });
                    }}
                    className="flex h-9 w-9 items-center justify-center rounded-full border border-border bg-white text-ink/55 transition-colors hover:border-ink/20 hover:text-ink"
                    aria-label="View more product thumbnails"
                  >
                    <ChevronDown className="h-4 w-4" />
                  </button>
                )}
              </div>

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
                className="group relative aspect-square flex-1 overflow-hidden rounded-[28px]"
                aria-label="Zoom product image"
              >
                {(product.isBestSeller || product.tag === "best" || product.isNew || product.tag === "new") && (
                  <span className="absolute left-5 top-5 z-10 rounded-full border border-border bg-white px-4 py-1.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-ink/70">
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
                      className="absolute left-4 top-1/2 z-10 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-border bg-white text-ink/60 transition-colors hover:text-ink"
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
                      className="absolute right-4 top-1/2 z-10 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-border bg-white text-ink/60 transition-colors hover:text-ink"
                      aria-label="Next image"
                    >
                      <ChevronRight className="h-5 w-5" />
                    </button>
                  </>
                )}
                {selectedImageSrc ? (
                  <Image
                    src={selectedImageSrc}
                    alt={productFullName(product)}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-[1.02]"
                    sizes="(max-width: 1024px) 100vw, 48vw"
                    priority
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-ink/25">
                    <ImageIcon className="h-12 w-12" />
                  </div>
                )}
                <button
                  type="button"
                  onClick={(event) => {
                    event.stopPropagation();
                    setLightboxOpen(true);
                  }}
                  className="absolute bottom-4 right-4 z-10 flex h-10 w-10 items-center justify-center rounded-full border border-border bg-white text-ink/65 transition-colors hover:text-ink"
                  aria-label="Expand image"
                >
                  <Maximize2 className="h-4 w-4" />
                </button>
              </div>
            </div>

            <div className="md:hidden">
              <div
                ref={mobileGalleryRef}
                onScroll={(event) => {
                  if (mobileGalleryItems.length <= 1) return;
                  const target = event.currentTarget;
                  const slides = Array.from(target.children) as HTMLElement[];
                  // Measure the real stride (slide width + gap) instead of scrollWidth / count
                  // so the active dot stays in sync with the slide in view.
                  const stride =
                    slides.length > 1
                      ? slides[1].offsetLeft - slides[0].offsetLeft
                      : target.clientWidth;
                  if (stride <= 0) return;
                  const index = Math.min(
                    slides.length - 1,
                    Math.max(0, Math.round(target.scrollLeft / stride)),
                  );
                  setSelectedImage(index);
                }}
                className="flex snap-x snap-mandatory gap-3 overflow-x-auto pb-3"
              >
                {mobileGalleryItems.map((image, index) => (
                  <button
                    key={(image ?? "placeholder") + index}
                    onClick={() => {
                      if (image) setSelectedImage(index);
                    }}
                    className={cn(
                      "relative aspect-square w-full min-w-full snap-center overflow-hidden rounded-[24px]",
                      !image && "border border-border bg-[#F8F6F2]",
                    )}
                    aria-label={`Open image ${index + 1}`}
                  >
                    {(product.isBestSeller || product.tag === "best" || product.isNew || product.tag === "new") && index === 0 && (
                      <span className="absolute left-4 top-4 z-10 rounded-full border border-border bg-white px-3.5 py-1.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-ink/70">
                        {product.isNew || product.tag === "new" ? "New Arrival" : "Best Seller"}
                      </span>
                    )}
                    {image ? (
                      <>
                        <Image
                          src={image}
                          alt={`${productFullName(product)} image ${index + 1}`}
                          fill
                          className="object-cover"
                          sizes="100vw"
                          priority={index === 0}
                        />
                        <button
                          type="button"
                          onClick={(event) => {
                            event.stopPropagation();
                            setSelectedImage(index);
                            setLightboxOpen(true);
                          }}
                          className="absolute bottom-4 right-4 z-10 flex h-9 w-9 items-center justify-center rounded-full border border-border bg-white text-ink/65"
                          aria-label="Expand image"
                        >
                          <Maximize2 className="h-4 w-4" />
                        </button>
                      </>
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-ink/25">
                        <ImageIcon className="h-12 w-12" />
                      </div>
                    )}
                  </button>
                ))}
              </div>
              {images.length > 1 && (
                <div className="flex items-center justify-center gap-2 text-xs text-ink/45">
                  {images.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => {
                        setSelectedImage(index);
                        const track = mobileGalleryRef.current;
                        const slide = track?.children[index] as HTMLElement | undefined;
                        if (!track || !slide) return;
                        track.scrollTo({
                          left: slide.offsetLeft,
                          behavior: "smooth",
                        });
                      }}
                      className="flex h-6 items-center px-0.5"
                      aria-label={`Select image ${index + 1}`}
                    >
                      <span
                        className={cn(
                          "block h-1.5 rounded-full transition-all",
                          selectedImage === index ? "w-6 bg-accent" : "w-2.5 bg-ink/20",
                        )}
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="flex flex-col gap-5 lg:pt-1">
            <div className="space-y-3">
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-ink/55">
                {SITE_NAME}
              </p>
              {/*
                `max-w-2xl`, not the `max-w-[12ch]` / `sm:max-w-[12ch]` this used to
                carry. Twelve CHARACTERS is barely wider than "Skin1004", so a normal
                product name broke into five or six lines and shoved the price and the
                buy button below the fold. The 3.6rem size made it worse, but the width
                cap was the cause.

                At `text-4xl` the info column (about 540px, from the grid at 490) fits
                roughly thirty characters per line, so a name of this length lands on
                two or three lines. `leading-tight` rather than the old `leading-[0.98]`:
                at 0.98 the lines nearly collide once the size drops.
              */}
              <h1 className="max-w-2xl break-words text-2xl font-display font-medium leading-tight text-ink sm:text-3xl lg:text-4xl">
                {productFullName(product)}
              </h1>
            </div>

            <div className="space-y-3">
              <div className="flex flex-wrap items-center gap-3">
                {/*
                  The price steps down with the title rather than staying at a fixed
                  2rem. At 32px it was larger than the reduced title on mobile, which
                  would have made the price the loudest thing on the page — the
                  opposite of the title leading. Now 20/24 against the title's
                  24/30/36, so it stays the most prominent text at every width.
                */}
                {compareAtPrice && compareAtPrice > displayPrice && (
                  <span className="text-base text-ink/35 line-through sm:text-lg">
                    {formatPrice(compareAtPrice)}
                  </span>
                )}
                <span className="text-xl font-semibold tracking-tight text-ink sm:text-2xl">
                  {formatPrice(displayPrice)}
                </span>
                {discountPercent > 0 && (
                  <span className="rounded-full bg-accent-pale px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.08em] text-accent">
                    {discountPercent}% Off
                  </span>
                )}
              </div>
              <div
                className={cn(
                  "flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.12em]",
                  canPurchase ? "text-success" : "text-ink-muted",
                )}
              >
                <span
                  className={cn(
                    "h-1.5 w-1.5 rounded-full",
                    canPurchase ? "animate-stock-radar bg-current" : "bg-current",
                  )}
                />
                <span>{availability?.label ?? (effectiveStock > 0 ? "IN STOCK" : "OUT OF STOCK")}</span>
              </div>
              {isPreOrder ? (
                <div className="rounded-2xl border border-border bg-white px-4 py-3 text-sm text-ink/70">
                  <p className="font-semibold uppercase tracking-[0.12em] text-accent">PRE-ORDER</p>
                  <p className="mt-2">Expected arrival: {formatPreOrderDate(product.preOrder?.expectedArrivalDate)}</p>
                  {product.preOrder?.customerMessage ? <p className="mt-1">{product.preOrder.customerMessage}</p> : null}
                  {availability?.label === "PRE-ORDER CLOSED" ? <p className="mt-1 font-medium text-ink">Pre-order Closed</p> : null}
                  {availability?.label === "PRE-ORDER FULL" ? <p className="mt-1 font-medium text-ink">Pre-order Full</p> : null}
                  {product.preOrder?.status === "accepting" && effectiveLimit > 0 ? (
                    <p className="mt-1">{effectiveLimit} pre-order slots remaining</p>
                  ) : null}
                </div>
              ) : null}
            </div>

            <div className="space-y-4">
              {/*
                `max-w-prose` keeps the measure near 65 characters, which is the readable
                range. It replaces a `max-w-[42ch]` cap — worth knowing if this ever needs to
                go the other way, because 42ch was the NARROWER of the two.

                The whole block is capped rather than the paragraph alone so the Read More
                control below sits on the same left edge as the text it belongs to.
              */}
              <div className="max-w-prose">
                <p
                  id="product-description"
                  className={cn(
                    "text-sm leading-relaxed text-ink/75",
                    isDescriptionLong && !isDescriptionExpanded && "line-clamp-4",
                  )}
                >
                  {descriptionText}
                </p>
                {isDescriptionLong ? (
                  <button
                    type="button"
                    onClick={() => setIsDescriptionExpanded((current) => !current)}
                    aria-expanded={isDescriptionExpanded}
                    aria-controls="product-description"
                    className="mt-2 text-xs font-semibold uppercase tracking-[0.12em] text-accent underline-offset-4 hover:underline"
                  >
                    {isDescriptionExpanded ? "Read Less" : "Read More"}
                  </button>
                ) : null}
              </div>
              {benefitChips.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {benefitChips.map((chip) => (
                    <span
                      key={chip}
                      className="rounded-full border border-border bg-white px-3.5 py-2 text-xs font-medium text-ink/65"
                    >
                      {chip}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {showSizeSelector && (
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm">
                  <span className="font-semibold text-ink">Size:</span>
                  <span className="font-semibold text-ink/85">{selectedSizeLabel}</span>
                </div>
                {sizeOptions.length > 1 && (
                  <div className="rounded-[24px] border border-border bg-white px-5 py-3">
                    <div className="flex flex-wrap gap-2">
                      {sizeOptions.map((opt, i) => (
                        <button
                          key={`${opt.label}-${i}`}
                          onClick={() => setSelectedSize(i)}
                          className={cn(
                            "min-h-10 rounded-full border px-4 text-center text-sm font-medium transition-all",
                            selectedSize === i
                              ? "border-accent bg-accent-pale text-ink"
                              : "border-border bg-white text-ink/65 hover:border-ink/25",
                          )}
                        >
                          {opt.volume || opt.label}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            <div className="space-y-4">
              <div className="flex flex-wrap items-center gap-3 min-[380px]:flex-nowrap">
                <div className="flex h-12 w-[132px] shrink-0 items-center rounded-full border border-border bg-white px-1 sm:w-[144px]">
                  <button
                    onClick={() => setQuantity((current) => clampQuantityToStock(current - 1, effectiveLimit))}
                    disabled={quantity <= 1}
                    className="flex h-10 w-10 items-center justify-center text-ink/55 transition-colors hover:text-ink"
                    aria-label="Decrease quantity"
                  >
                    <Minus className="h-4 w-4" />
                  </button>
                  <span className="flex-1 text-center text-sm font-semibold">{quantity}</span>
                  <button
                    onClick={() => setQuantity((current) => clampQuantityToStock(current + 1, effectiveLimit))}
                    disabled={quantity >= effectiveLimit || !canPurchase}
                    className="flex h-10 w-10 items-center justify-center text-ink/55 transition-colors hover:text-ink disabled:cursor-not-allowed disabled:text-neutral-300 disabled:hover:text-neutral-300"
                    aria-label="Increase quantity"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
                <button
                  onClick={() => addToCart()}
                  disabled={!canPurchase}
                  className={cn(
                    "flex h-12 min-w-[min(100%,12rem)] flex-1 items-center justify-center gap-2 rounded-full px-5 text-sm font-semibold transition-colors min-[380px]:min-w-0 sm:px-6",
                    !canPurchase
                      ? "cursor-not-allowed bg-neutral-200 text-neutral-500"
                      : "bg-cart text-white hover:bg-cart-dark",
                  )}
                >
                  {availability?.ctaLabel ?? "Add to Cart"}
                  {/* · {formatPrice(displayPrice)}
                  <ChevronRight className="h-4 w-4" /> */}
                </button>

                <button
                  onClick={handleWishlist}
                  disabled={isTogglingWishlist}
                  className={cn(
                    "flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-border bg-white transition-all hover:border-accent/50 hover:text-accent max-[379px]:ml-auto",
                    isWishlisted && "border-accent/25 bg-accent-pale text-accent",
                    isTogglingWishlist && "cursor-wait opacity-70",
                  )}
                  aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
                >
                  <Heart className={cn("h-5 w-5", isWishlisted && "fill-current")} />
                </button>
              </div>
            </div>
          </div>
        </section>

      </div>

      <section className="border-t border-ink/10 bg-white">
        <div className="border-b border-ink/10">
          <div className="mx-auto max-w-[1400px] px-5 sm:px-6">
            <div className="-mx-5 overflow-x-auto px-5 sm:-mx-6 sm:px-6">
              <div className="flex min-w-max gap-8">
                {[...PRODUCT_TABS, { key: "reviews" as const, label: reviewTabLabel }].map((tab) => (
                  <button
                    key={tab.key}
                    onClick={() => setActiveTab(tab.key)}
                    className={cn(
                      "relative py-4 text-sm font-medium transition-colors",
                      activeTab === tab.key ? "text-[#1F1F1F]" : "text-[#7A746F] hover:text-[#1F1F1F]",
                    )}
                  >
                    {tab.label}
                    {activeTab === tab.key && (
                      <span className="absolute inset-x-0 bottom-0 h-px bg-accent" />
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="mx-auto max-w-[1400px] px-5 sm:px-6">
          <div className="py-8 sm:py-10 lg:py-12">
            {activeTab === "overview" && (
              <div className="space-y-8 lg:space-y-10">
                <div className="grid gap-8 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)] lg:gap-10">
                  <section className="space-y-4 lg:pr-8">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#6E6966]">
                      About This Product
                    </p>
                    <p className="max-w-[64ch] text-sm leading-7 text-[#5F5A57]">
                      {product.longDescription || product.description}
                    </p>
                  </section>

                  <section className="space-y-4 lg:border-l lg:border-[#E6E0DA] lg:pl-8">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#6E6966]">
                      Best For
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {bestForChips.length > 0 ? bestForChips.map((chip) => (
                        <span key={chip} className="rounded-full border border-[#E4DDD6] bg-[#FCFAF8] px-3.5 py-1.5 text-xs font-medium text-[#6A6561]">{chip}</span>
                      )) : <span className="text-sm text-[#8A8581]">All skin types</span>}
                    </div>
                  </section>
                </div>

                <section className="border-t border-[#E6E0DA] pt-8">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#6E6966]">
                    The Mioralane Promise
                  </p>
                  <div className="mt-6 rounded-[20px] border border-[#FBD6DE] bg-[#FFF6F8] p-7 sm:p-8">
                    <div className="grid gap-0 md:grid-cols-3">
                      {TRUST_ITEMS.map((item) => {
                        const Icon = item.icon;
                        return (
                          <div
                            key={item.title}
                            className="flex items-start gap-4 border-t border-[#FAD8E1] py-5 first:border-t-0 first:pt-0 last:pb-0 md:border-l md:border-t-0 md:px-6 md:py-0 md:first:border-l-0 md:first:pl-0 md:last:pr-0"
                          >
                            <span className="mt-0.5 flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-accent-pale text-accent sm:h-12 sm:w-12">
                              <Icon className="h-5 w-5" />
                            </span>
                            <div>
                              <h3 className="text-[15px] font-semibold leading-6 text-[#1F1F1F] sm:text-base">{item.title}</h3>
                              <p className="mt-1 max-w-[28ch] text-sm leading-6 text-[#5F5A57]">{item.text}</p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </section>
              </div>
            )}

            {activeTab === "ingredients" && (
              <div className="space-y-4">
                <h3 className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#6E6966]">
                  Full Ingredient List
                </h3>
                {ingredients.length > 0 ? (
                  <ul className="flex flex-wrap gap-2" aria-label="Product ingredients">
                    {ingredients.map((ingredient, index) => (
                      <li
                        key={`${ingredient}-${index}`}
                        className="rounded-full bg-gray-100 px-3 py-1.5 text-sm text-gray-700"
                      >
                        {ingredient}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm leading-7 text-[#5F5A57]">
                    Full INCI ingredient list is not available in the current product data.
                  </p>
                )}
              </div>
            )}

            {activeTab === "shipping" && (
              <div className="grid gap-8 lg:grid-cols-[1fr_1fr] lg:gap-10">
                <section className="space-y-5">
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#6E6966]">Delivery</p>
                    <div className="mt-4 rounded-[20px] border border-[#ECE5DE] bg-[#FCFAF8] px-5">
                      {shippingNotes.delivery.map((item) => (
                        <div key={item.label} className="flex items-center justify-between gap-6 border-t border-[#EEE7E0] py-4 first:border-t-0">
                          <span className="text-sm text-[#5F5A57]">{item.label}</span>
                          <span className="text-right text-sm font-medium text-[#1F1F1F]">{item.value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </section>

                <section className="space-y-6">
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#6E6966]">Returns</p>
                    <p className="mt-4 max-w-xl text-sm leading-7 text-[#5F5A57]">{shippingNotes.returns}</p>
                  </div>
                  {product.source ? (
                    <div className="border-t border-[#E6E0DA] pt-6">
                      <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#6E6966]">Authenticity Guarantee</p>
                      <p className="mt-4 max-w-xl text-sm leading-7 text-[#5F5A57]">{shippingNotes.authenticity}</p>
                    </div>
                  ) : null}
                </section>
              </div>
            )}

            {activeTab === "reviews" && (
              <ProductReviews productId={product.id} productName={productFullName(product)} />
            )}
          </div>
        </div>
      </section>

      {relatedProducts.length > 0 && (
        <section className="bg-white py-16 sm:py-20 lg:py-24">
          <div className="mx-auto max-w-[1400px] px-5 sm:px-6">
            <h2 className="text-3xl font-display font-medium text-ink sm:text-4xl">You May Also Like</h2>
            <div className="mt-10 grid grid-cols-1 gap-4 min-[430px]:grid-cols-2 sm:gap-5 lg:grid-cols-4">
              {relatedProducts.map((p) => (
                <div key={p.id} className="flex h-full flex-col">
                  <Link href={`/product/${p.slug}`} className="relative aspect-[4/5] overflow-hidden rounded-2xl bg-[#FAF9F7]"><RelatedThumb product={p} /></Link>
                  <div className="mt-3 flex flex-1 flex-col">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-ink/35">{p.brand}</p>
                    <Link href={`/product/${p.slug}`} className="mt-1 line-clamp-2 block min-h-10 text-sm font-semibold leading-5 text-ink transition-colors hover:text-accent">{p.name}</Link>
                    <div className="mt-auto flex flex-wrap items-center justify-between gap-3 pt-3"><span className="text-sm font-semibold text-ink">{formatPrice(p.price)}</span><button onClick={() => { addItem({ ...p, itemType: p.itemType ?? (p.category === "combo" ? "combo" : "product") }, 1); addToast(`${p.name} added to cart`); }} className="rounded-full border border-ink/15 px-3 py-1.5 text-xs font-medium text-ink transition-colors hover:border-ink hover:bg-ink hover:text-white">Add to Cart</button></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}      <div className="fixed inset-x-0 bottom-0 z-40 flex items-center gap-2 border-t border-ink/10 bg-white/95 px-3 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] backdrop-blur min-[375px]:gap-3 min-[375px]:px-4 md:hidden">
        <div className="flex items-center rounded-full border border-ink/15">
          <button
            onClick={() => setQuantity((current) => clampQuantityToStock(current - 1, effectiveLimit))}
            disabled={quantity <= 1}
            className="flex h-11 w-9 items-center justify-center text-ink/60 hover:text-ink"
            aria-label="Decrease quantity"
          >
            <Minus className="h-4 w-4" />
          </button>
          <span className="w-7 text-center text-sm font-medium">{quantity}</span>
          <button
            onClick={() => setQuantity((current) => clampQuantityToStock(current + 1, effectiveLimit))}
            disabled={quantity >= effectiveLimit || !canPurchase}
            className="flex h-11 w-9 items-center justify-center text-ink/60 hover:text-ink disabled:cursor-not-allowed disabled:text-neutral-300 disabled:hover:text-neutral-300"
            aria-label="Increase quantity"
          >
            <Plus className="h-4 w-4" />
          </button>
        </div>
        <button
          onClick={() => addToCart()}
          disabled={!canPurchase}
          className="flex h-11 min-w-0 flex-1 items-center justify-center gap-2 rounded-full bg-cart px-3 text-sm font-semibold text-white transition-colors hover:bg-cart-dark disabled:cursor-not-allowed disabled:bg-neutral-200 disabled:text-neutral-500"
        >
          <ShoppingBag className="h-4 w-4" />
          {availability?.ctaLabel ?? "Add to Cart"}
        </button>
      </div>

      {lightboxOpen && (
        <div
          className="fixed inset-0 z-[96] flex items-center justify-center bg-black/95 p-4"
          onClick={() => setLightboxOpen(false)}
        >
          <button
            onClick={() => setLightboxOpen(false)}
            className="absolute right-4 top-4 flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20"
            aria-label="Close zoom"
          >
            <X className="h-6 w-6" />
          </button>
          <div className="relative h-full max-h-[85dvh] w-full max-w-3xl">
            {selectedImageSrc ? (
              <Image
                src={selectedImageSrc}
                alt={productFullName(product)}
                fill
                className="object-contain"
                sizes="(max-width: 768px) 100vw, 48rem"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-white/40">
                <ImageIcon className="h-16 w-16" />
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
