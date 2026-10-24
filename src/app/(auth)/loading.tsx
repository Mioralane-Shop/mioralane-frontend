import { FormSkeleton } from "@/components/common/skeletons";
import { Skeleton } from "@/components/ui/skeleton";

/** Log in / register / reset: one centred card with a short form in it. */
export default function Loading() {
  return (
    <div className="flex min-h-[70vh] items-center justify-center px-6 py-12">
      <div className="w-full max-w-md rounded-2xl border border-border-light bg-white p-6">
        <Skeleton className="h-7 w-40" />
        <Skeleton className="mt-3 h-4 w-56" />
        <div className="mt-6">
          <FormSkeleton fields={3} columns={1} />
        </div>
        <Skeleton className="mt-6 h-12 w-full rounded-full" />
      </div>
    </div>
  );
}
