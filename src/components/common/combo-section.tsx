"use client";

import { useRouter } from "next/navigation";
import { AlertCircle, Loader2, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ProductCard } from "@/components/product/product-card";
import { useCombos } from "@/hooks/use-combos";
import type { ComboCardMeta } from "@/components/product/product-card";
import type { ComboProduct } from "@/services/combo.service";
import type { Product } from "@/types/product";

/** Extract ComboCardMeta fields from an API combo product response. */
function extractComboMeta(p: Product | ComboProduct): ComboCardMeta | undefined {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const c = p as any;
  if (c.category !== "combo") return undefined;
  return {
    badge: c.badge,
    savings:
      c.savings ??
      (c.compareAtPrice && c.compareAtPrice > c.price
        ? c.compareAtPrice - c.price
        : 0),
    includedItems: c.includedItems,
    routineTag: c.routineTag,
  };
}

/** Bundle card grid for the Combo page â€” fetches live data from the API. */
export function ComboSection() {
  const router = useRouter();
  const {
    data: combos,
    isLoading,
    isError,
    refetch,
    isFetching,
  } = useCombos();
  const hasError = isError && (!combos || combos.length === 0);

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 gap-2 sm:gap-5 lg:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div
            key={i}
            className="aspect-[3/4] animate-pulse rounded-2xl bg-ink/[0.04]"
          />
        ))}
      </div>
    );
  }

  if (hasError) {
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-white px-6 py-20 text-center">
        <AlertCircle className="h-16 w-16 text-rose-300" />
        <h3 className="mt-4 text-lg font-semibold text-ink">
          Could not load bundles
        </h3>
        <p className="mt-2 max-w-sm text-sm text-ink-muted">
          We ran into a problem fetching the latest bundle offers. Please try again.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Button onClick={() => refetch()} disabled={isFetching}>
            {isFetching ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Retrying...
              </>
            ) : (
              "Retry"
            )}
          </Button>
          <Button variant="outline" onClick={() => router.push("/shop")}>
            Continue Shopping
          </Button>
        </div>
      </div>
    );
  }

  if (!combos || combos.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-accent-pale text-accent-dark">
          <Package className="h-7 w-7" />
        </div>
        <h3 className="text-lg font-semibold text-ink">
          No combo offers right now
        </h3>
        <p className="mt-1.5 max-w-sm text-sm text-ink-muted">
          We&apos;re putting together new bundles. Check back soon for curated routines and exclusive combo deals.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-2 sm:gap-5 lg:grid-cols-3">
      {combos.map((product) => (
        <ProductCard
          key={product.id}
          product={product}
          combo={extractComboMeta(product)}
        />
      ))}
    </div>
  );
}
