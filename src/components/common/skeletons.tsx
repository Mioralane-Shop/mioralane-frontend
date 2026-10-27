import { Skeleton } from "@/components/ui/skeleton";
import { PRODUCT_GRID_CLASSES } from "@/lib/product-grid";

/**
 * Storefront-shaped skeletons, every one built from the shared `Skeleton`.
 *
 * Before this file the loading treatment was a handful of one-off shimmer blocks in
 * two pages and a spinner in a dozen more. These are the shapes the storefront
 * actually renders — the product card, the brand tile, the account list row — so a
 * loading page keeps its layout and nothing jumps when the data lands.
 *
 * Product media placeholders use `bg-ink/[0.04]` rather than the primitive's default
 * tint: the default reads pink, which is right for text but wrong for a photo slot.
 * The two treatments are intentional, not drift.
 */

/** A placeholder for the image slot inside a product card or gallery. */
const MEDIA_TINT = "bg-ink/[0.04]";

/** A stack of text lines, the last one short. */
export function SkeletonText({ lines = 3, className }: { lines?: number; className?: string }) {
  return (
    <div className={className} aria-hidden="true">
      <div className="space-y-2.5">
        {Array.from({ length: lines }).map((_, index) => (
          <Skeleton
            key={index}
            className={index === lines - 1 ? "h-3.5 w-2/3" : "h-3.5 w-full"}
          />
        ))}
      </div>
    </div>
  );
}

/** The eyebrow, `h1` and lead paragraph at the top of every public page. */
export function PageHeaderSkeleton({ withAction = false }: { withAction?: boolean }) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
      <div className="max-w-3xl space-y-3">
        <Skeleton className="h-3 w-20" />
        <Skeleton className="h-9 w-72 max-w-full" />
        <Skeleton className="h-4 w-[30rem] max-w-full" />
      </div>
      {withAction ? <Skeleton className="h-11 w-36 shrink-0 rounded-full" /> : null}
    </div>
  );
}

/** The shop grid: image slot plus name and price lines. */
export function ProductGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className={PRODUCT_GRID_CLASSES}>
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className="space-y-3">
          <Skeleton className={`aspect-[3/4] w-full rounded-2xl ${MEDIA_TINT}`} />
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
        </div>
      ))}
    </div>
  );
}

/** The `/brands` grid: fixed-height tiles, a logo or a name centred in each. */
export function TileGridSkeleton({ count = 15 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={index}
          className="flex h-32 items-center justify-center rounded-2xl border border-border-light bg-white px-4"
        >
          <Skeleton className="h-8 w-24" />
        </div>
      ))}
    </div>
  );
}

/** Account-area list rows: an order, a wishlist line, a saved address. */
export function ListRowsSkeleton({ rows = 4 }: { rows?: number }) {
  return (
    <div className="space-y-4">
      {Array.from({ length: rows }).map((_, index) => (
        <div key={index} className="rounded-2xl border border-border-light bg-white p-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <Skeleton className={`h-20 w-16 shrink-0 rounded-xl ${MEDIA_TINT}`} />
              <div className="space-y-2">
                <Skeleton className="h-4 w-48" />
                <Skeleton className="h-3 w-32" />
                <Skeleton className="h-3 w-24" />
              </div>
            </div>
            <Skeleton className="h-9 w-28 rounded-full" />
          </div>
        </div>
      ))}
    </div>
  );
}

/** Labelled inputs: checkout, profile, an address form. */
export function FormSkeleton({
  fields = 5,
  columns = 2,
}: {
  fields?: number;
  columns?: 1 | 2;
}) {
  return (
    <div className={columns === 2 ? "grid grid-cols-1 gap-5 sm:grid-cols-2" : "grid grid-cols-1 gap-5"}>
      {Array.from({ length: fields }).map((_, index) => (
        <div key={index} className="space-y-2.5">
          <Skeleton className="h-3.5 w-24" />
          <Skeleton className="h-11 w-full rounded-xl" />
        </div>
      ))}
    </div>
  );
}

/** One order or cart line: image, description, price. */
export function LineItemsSkeleton({ rows = 3 }: { rows?: number }) {
  return (
    <div className="space-y-4">
      {Array.from({ length: rows }).map((_, index) => (
        <div key={index} className="flex items-start gap-4 border-b border-border-light pb-4">
          <Skeleton className={`h-24 w-20 shrink-0 rounded-xl ${MEDIA_TINT}`} />
          <div className="flex-1 space-y-2.5">
            <Skeleton className="h-4 w-56" />
            <Skeleton className="h-3 w-24" />
            <Skeleton className="h-8 w-28 rounded-full" />
          </div>
          <Skeleton className="h-4 w-16" />
        </div>
      ))}
    </div>
  );
}

/** The order summary panel beside the cart and checkout. */
export function SummaryPanelSkeleton({ rows = 4 }: { rows?: number }) {
  return (
    <div className="rounded-2xl border border-border-light bg-white p-5">
      <Skeleton className="h-5 w-32" />
      <div className="mt-5 space-y-3">
        {Array.from({ length: rows }).map((_, index) => (
          <div key={index} className="flex items-center justify-between">
            <Skeleton className="h-3.5 w-24" />
            <Skeleton className="h-3.5 w-16" />
          </div>
        ))}
      </div>
      <Skeleton className="mt-5 h-12 w-full rounded-full" />
    </div>
  );
}

/** An article: title, meta line, then paragraphs. */
export function ArticleSkeleton() {
  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <Skeleton className="h-3 w-20" />
      <Skeleton className="h-10 w-full" />
      <Skeleton className="h-4 w-40" />
      <Skeleton className={`aspect-[16/9] w-full rounded-2xl ${MEDIA_TINT}`} />
      <SkeletonText lines={4} />
      <SkeletonText lines={5} />
    </div>
  );
}

/** The product detail page: gallery on the left, buy box on the right. */
export function ProductDetailSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-10 lg:grid-cols-2">
      <Skeleton className={`aspect-square w-full rounded-[2rem] ${MEDIA_TINT}`} />
      <div className="space-y-4">
        <Skeleton className="h-5 w-24" />
        <Skeleton className="h-10 w-3/4" />
        <Skeleton className="h-6 w-1/3" />
        <Skeleton className="h-28 w-full" />
        <Skeleton className="h-12 w-full rounded-full" />
      </div>
    </div>
  );
}
