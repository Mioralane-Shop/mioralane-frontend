import { PageHeaderSkeleton, ProductGridSkeleton } from "@/components/common/skeletons";

/** The default public shape: a page header followed by a card grid. */
export default function Loading() {
  return (
    <div className="mx-auto max-w-[1200px] px-6 py-12">
      <PageHeaderSkeleton />
      <div className="mt-10">
        <ProductGridSkeleton count={8} />
      </div>
    </div>
  );
}
