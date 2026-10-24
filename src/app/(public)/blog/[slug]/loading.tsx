import { ArticleSkeleton } from "@/components/common/skeletons";

export default function Loading() {
  return (
    <div className="mx-auto max-w-[1200px] px-6 py-12">
      <ArticleSkeleton />
    </div>
  );
}
