import { Skeleton } from "@/components/ui/skeleton";

/** The confirmation: a centred card, so the receipt does not pop in. */
export default function Loading() {
  return (
    <div className="mx-auto max-w-[1200px] px-6 py-16">
      <div className="mx-auto max-w-xl rounded-2xl border border-border-light bg-white p-8">
        <Skeleton className="mx-auto h-14 w-14 rounded-full" />
        <Skeleton className="mx-auto mt-6 h-7 w-56" />
        <Skeleton className="mx-auto mt-3 h-4 w-72" />
        <div className="mt-8 space-y-3">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="flex items-center justify-between">
              <Skeleton className="h-3.5 w-28" />
              <Skeleton className="h-3.5 w-20" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
