import { PageHeaderSkeleton, ListRowsSkeleton } from "@/components/common/skeletons";

/** Every account page is a header plus a list of rows. */
export default function Loading() {
  return (
    <div className="mx-auto max-w-[1400px] px-4 py-8 sm:px-6">
      <PageHeaderSkeleton />
      <div className="mt-8">
        <ListRowsSkeleton rows={4} />
      </div>
    </div>
  );
}
