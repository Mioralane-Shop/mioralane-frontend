import Link from "next/link";
import Image from "next/image";
import { Star } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatPrice } from "@/lib/utils";
import type { Product } from "@/types/product";

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  return (
    <Card className="group overflow-hidden border-rose-100 transition-shadow hover:shadow-md">
      <Link href={`/product/${product.slug}`}>
        <div className="relative aspect-square overflow-hidden bg-rose-50">
          <Image
            src={product.images[0]}
            alt={product.name}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
          />
          <div className="absolute left-3 top-3 flex flex-col gap-1">
            {product.isNew && <Badge variant="secondary">New</Badge>}
            {product.isBestSeller && <Badge>Best Seller</Badge>}
          </div>
          {product.compareAtPrice && (
            <div className="absolute right-3 top-3">
              <Badge variant="outline" className="bg-white">
                Sale
              </Badge>
            </div>
          )}
        </div>
      </Link>

      <CardContent className="p-4">
        <Link href={`/product/${product.slug}`}>
          <h3 className="text-sm font-medium text-neutral-800 line-clamp-1 hover:text-rose-500 transition-colors">
            {product.name}
          </h3>
        </Link>

        <p className="mt-1 text-xs text-neutral-400 line-clamp-2">
          {product.description}
        </p>

        <div className="mt-2 flex items-center gap-1">
          <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
          <span className="text-xs font-medium text-neutral-600">
            {product.rating}
          </span>
          <span className="text-xs text-neutral-400">
            ({product.reviewCount})
          </span>
        </div>

        <div className="mt-3 flex items-center justify-between">
          <div className="flex items-baseline gap-1.5">
            <span className="text-base font-semibold text-rose-600">
              {formatPrice(product.price)}
            </span>
            {product.compareAtPrice && (
              <span className="text-xs text-neutral-400 line-through">
                {formatPrice(product.compareAtPrice)}
              </span>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
