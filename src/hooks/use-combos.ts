"use client";

import { useQuery } from "@tanstack/react-query";
import { comboService } from "@/services/combo.service";
import type { ComboProduct } from "@/services/combo.service";

/**
 * Fetches combo / bundle products from the API.
 */
export function useCombos() {
  return useQuery<ComboProduct[]>({
    queryKey: ["combos"],
    queryFn: async () => {
      const res = await comboService.getAll();
      return res.combos;
    },
    staleTime: 5 * 60 * 1000,
    retry: false,
  });
}

export function useCombo(slug: string) {
  return useQuery<ComboProduct>({
    queryKey: ["combo", slug],
    queryFn: () => comboService.getBySlug(slug),
    enabled: !!slug,
    staleTime: 5 * 60 * 1000,
    retry: false,
  });
}
