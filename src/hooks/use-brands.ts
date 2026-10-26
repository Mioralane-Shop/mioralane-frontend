"use client";

import { useQuery } from "@tanstack/react-query";
import { brandService } from "@/services/brand.service";
import type { Brand } from "@/types/brand";

/** Brands change when an admin edits them, not per request. */
const BRANDS_STALE_TIME = 5 * 60 * 1000;

/**
 * Public brands for the navbar and the brand dropdown.
 *
 * Returns `brands: Brand[]` — never `undefined` — for one reason: the contract
 * every consumer relies on is *degrade to the bundled fallback*, and a hook that
 * hands back `undefined` on a failed request forces each caller to invent that
 * default. With `retry: false` a failure settles once and stays settled, so a
 * dead API cannot turn the navbar into a retry loop; the caller sees `[]` and
 * renders `constants/site.ts`'s list instead.
 */
export function useBrands() {
  const { data, isLoading, isError } = useQuery<Brand[]>({
    queryKey: ["brands", "public"],
    queryFn: () => brandService.getPublicBrands(),
    staleTime: BRANDS_STALE_TIME,
    retry: false,
  });

  return { brands: data ?? [], isLoading, isError };
}
