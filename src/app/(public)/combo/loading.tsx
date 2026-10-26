import { PageHeaderSkeleton, ProductGridSkeleton } from "@/components/common/skeletons";

export default function Loading() {
  return (
    <div className="mx-auto max-w-[1200px] px-6 py-12">
      <PageHeaderSkeleton />
      <div className="mt-10">
        <ProductGridSkeleton count={6} />
      </div>
    </div>
  );
}
