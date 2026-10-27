import { FormSkeleton, SummaryPanelSkeleton } from "@/components/common/skeletons";
import { Skeleton } from "@/components/ui/skeleton";

/** Checkout: the address and payment form beside the order summary. */
export default function Loading() {
  return (
    <div className="mx-auto max-w-[1200px] px-6 py-12">
      <Skeleton className="h-8 w-48" />
      <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-[1fr_20rem]">
        <div className="space-y-8">
          <FormSkeleton fields={6} columns={2} />
          <FormSkeleton fields={4} columns={2} />
        </div>
        <SummaryPanelSkeleton />
      </div>
    </div>
  );
}
