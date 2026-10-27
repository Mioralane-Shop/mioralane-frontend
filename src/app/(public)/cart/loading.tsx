import { LineItemsSkeleton, SummaryPanelSkeleton } from "@/components/common/skeletons";
import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="mx-auto max-w-[1200px] px-6 py-12">
      <Skeleton className="h-8 w-40" />
      <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-[1fr_20rem]">
        <LineItemsSkeleton rows={3} />
        <SummaryPanelSkeleton />
      </div>
    </div>
  );
}
