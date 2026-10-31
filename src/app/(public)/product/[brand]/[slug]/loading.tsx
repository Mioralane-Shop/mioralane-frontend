import { PageHeaderSkeleton, ProductDetailSkeleton } from "@/components/common/skeletons";
import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="mx-auto max-w-[1200px] px-6 py-12">
      <ProductDetailSkeleton />
      <div className="mt-16 space-y-6">
        <Skeleton className="h-6 w-48" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-5/6" />
        <Skeleton className="h-4 w-2/3" />
      </div>
      <div className="mt-16">
        <PageHeaderSkeleton />
      </div>
    </div>
  );
}
