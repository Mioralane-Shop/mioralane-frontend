import { PageHeaderSkeleton, ProductGridSkeleton } from "@/components/common/skeletons";
import { Skeleton } from "@/components/ui/skeleton";
import {
  PLP_CONTENT_COLUMN_CLASSES,
  PLP_FRAME_CLASSES,
  PRODUCT_SIDEBAR_CLASSES,
} from "@/lib/product-grid";

/**
 * The shop, while it loads.
 *
 * Deliberately built from the same geometry the real page uses — the wide frame, the
 * 256px sidebar, the centred 1200px column — because a skeleton that reserves the
 * wrong space is worse than none: the content jumps sideways the moment it arrives.
 * The class constants come from `lib/product-grid` so the two cannot drift.
 */
export default function Loading() {
  return (
    <div className={PLP_FRAME_CLASSES}>
      <PageHeaderSkeleton />

      <div className="mt-10 flex flex-col gap-6 lg:flex-row lg:gap-10">
        <div className={`${PRODUCT_SIDEBAR_CLASSES} space-y-6`}>
          {Array.from({ length: 3 }).map((_, index) => (
            <div key={index} className="space-y-3">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-3.5 w-full" />
              <Skeleton className="h-3.5 w-5/6" />
              <Skeleton className="h-3.5 w-4/6" />
            </div>
          ))}
        </div>

        <div className="min-w-0 flex-1">
          <div className={PLP_CONTENT_COLUMN_CLASSES}>
            <Skeleton className="mb-5 h-6 w-40" />
            <ProductGridSkeleton count={8} />
          </div>
        </div>
      </div>
    </div>
  );
}
