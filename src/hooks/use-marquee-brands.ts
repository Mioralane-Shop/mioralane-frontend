"use client";

import { useQuery } from "@tanstack/react-query";
import { brandService } from "@/services/brand.service";
import type { Brand } from "@/types/brand";

const BRANDS_STALE_TIME = 5 * 60 * 1000;

/**
 * The homepage marquee's brands — visible, opted in, and carrying a logo.
 *
 * Separate from {@link useBrands} rather than a client-side filter over the same
 * list: the two have different contracts. The navbar falls back to a bundled list
 * when the request fails; the marquee falls back to **nothing at all**, because
 * there is no bundled set of logos to fall back to and a half-rendered row of
 * six hardcoded marks is worse than an absent section.
 */
export function useMarqueeBrands() {
  const { data, isLoading } = useQuery<Brand[]>({
    queryKey: ["brands", "marquee"],
    queryFn: () => brandService.getMarqueeBrands(),
    staleTime: BRANDS_STALE_TIME,
    retry: false,
  });

  return { brands: data ?? [], isLoading };
}
