import { useRelatedProducts } from "@/hooks/use-products";
import { ProductCard } from "./product-card";
import { Skeleton } from "@/components/ui/skeleton";

interface RelatedProductsProps {
  category: string;
  excludeId: string;
}

export function RelatedProducts({ category, excludeId }: RelatedProductsProps) {
  const { data: products, isLoading } = useRelatedProducts(category, excludeId);

  if (!isLoading && (!products || products.length === 0)) return null;

  return (
    <section className="py-12">
      <h2 className="mb-6 text-2xl font-light tracking-tight text-neutral-800">
        You May Also Like
      </h2>
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {isLoading
          ? Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="space-y-3">
                <Skeleton className="aspect-square w-full rounded-2xl" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            ))
          : products?.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
      </div>
    </section>
  );
}
