import Link from "next/link";
import Image from "next/image";
import { formatPrice } from "@/lib/utils";
import { useCartStore } from "@/store/cart.store";
import { DUMMY_PRODUCTS } from "@/constants/site";
import type { Product } from "@/types/product";

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const addItem = useCartStore((s) => s.addItem);
  const origPrice = Math.round(product.price * 1.2);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    // Find the full product from DUMMY_PRODUCTS to satisfy cart store type
    const fullProduct =
      DUMMY_PRODUCTS.find((p) => p.id === product.id) ?? product;
    addItem(fullProduct, 1);
  };

  return (
    <Link href={`/product/${product.slug}`} className="group block">
      <div className="overflow-hidden rounded-2xl border border-neutral-100 bg-white shadow-sm transition-shadow hover:shadow-md">
        {/* Image */}
        <div className="relative aspect-square overflow-hidden bg-gradient-to-br from-rose-50 to-amber-50">
          <Image
            src={product.images[0]}
            alt={product.name}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          />
          {product.tag === "best" && (
            <span className="absolute left-3 top-3 rounded-full bg-brand px-3 py-1 text-[11px] font-bold tracking-wide text-white shadow-md">
              HUMID PICK
            </span>
          )}
          {product.tag === "new" && (
            <span className="absolute left-3 top-3 rounded-full bg-emerald-500 px-3 py-1 text-[11px] font-bold tracking-wide text-white shadow-md">
              NEW
            </span>
          )}
          {(product.category === "combo" || product.category === "sets") && (
            <span className="absolute left-3 top-3 rounded-full bg-violet-500 px-3 py-1 text-[11px] font-bold tracking-wide text-white shadow-md">
              BUNDLE
            </span>
          )}
        </div>

        {/* Info */}
        <div className="p-4">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-medium tracking-wider text-ink/40 uppercase">
              {product.brand}
            </span>
            <span className="flex items-center gap-1 text-xs text-amber-500">
              ★ {product.rating}
            </span>
          </div>

          <h3 className="mt-1.5 text-sm font-medium text-ink line-clamp-1">
            {product.name}
          </h3>

          {/* Concern tags */}
          {product.concerns && product.concerns.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1">
              {product.concerns.slice(0, 2).map((c) => (
                <span
                  key={c}
                  className="rounded-full bg-surface px-2 py-0.5 text-[10px] text-ink/50"
                >
                  {c}
                </span>
              ))}
            </div>
          )}

          {/* Pricing */}
          <div className="mt-3 flex items-center gap-2">
            <span className="text-base font-bold text-brand">
              {formatPrice(product.price)}
            </span>
            <span className="text-xs text-ink/30 line-through">
              {formatPrice(origPrice)}
            </span>
          </div>

          {/* Add to Cart */}
          <button
            onClick={handleAddToCart}
            className="mt-3 w-full rounded-full border border-brand py-2 text-xs font-medium text-brand transition-colors hover:bg-brand hover:text-white"
          >
            Add to Cart
          </button>
        </div>
      </div>
    </Link>
  );
}
