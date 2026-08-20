"use client";

import { useQuery } from "@tanstack/react-query";
import { comboService } from "@/services/combo.service";
import type { ComboProduct } from "@/services/combo.service";
import type { Product } from "@/types/product";

/**
 * Fetches combo / bundle products from the API.
 * Returns an empty array when no combos are available (no dummy fallback).
 */
export function useCombos() {
    return useQuery<(Product | ComboProduct)[]>({
        queryKey: ["combos"],
        queryFn: async () => {
            const res = await comboService.getAll();
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const raw = res as any;
            return Array.isArray(raw?.combos) ? raw.combos : [];
        },
        staleTime: 5 * 60 * 1000, // 5 minutes
    });
}

export function useCombo(slug: string) {
    return useQuery<ComboProduct>({
        queryKey: ["combo", slug],
        queryFn: () => comboService.getBySlug(slug),
        enabled: !!slug,
        staleTime: 5 * 60 * 1000,
    });
}
