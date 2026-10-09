import { PageHeaderSkeleton, ProductGridSkeleton } from "@/components/common/skeletons";
import { Skeleton } from "@/components/ui/skeleton";

/** The shop: filter sidebar and toolbar above a denser grid. */
export default function Loading() {
  return (
    <div className="mx-auto max-w-[1200px] px-6 py-12">
      <PageHeaderSkeleton />
      <div className="mt-10 flex gap-8">
        <div className="hidden w-56 shrink-0 space-y-6 lg:block">
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
          <Skeleton className="mb-5 h-6 w-40" />
          <ProductGridSkeleton count={9} />
        </div>
      </div>
    </div>
  );
}
