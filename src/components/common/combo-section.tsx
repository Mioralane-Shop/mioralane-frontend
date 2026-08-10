"use client";

import { Package } from "lucide-react";
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
        savings: c.savings ?? (c.compareAtPrice && c.compareAtPrice > c.price ? c.compareAtPrice - c.price : 0),
        includedItems: c.includedItems,
        routineTag: c.routineTag,
    };
}

/** Bundle card grid for the Combo page — fetches live data from the API. */
export function ComboSection() {
    const { data: combos, isLoading } = useCombos();

    // ── Loading skeleton ──
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

    // ── Empty state ──
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
                    We&rsquo;re putting together new bundles. Check back soon for
                    curated routines and exclusive combo deals.
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
