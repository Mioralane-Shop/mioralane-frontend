"use client";

import { useQuery } from "@tanstack/react-query";
import { productService } from "@/services/product.service";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import type { Product } from "@/types/product";

interface UseProductSearchOptions {
  enabled?: boolean;
  limit?: number;
  debounceMs?: number;
}

async function fetchProductSearch(query: string, limit: number): Promise<Product[]> {
  const res = await productService.getAll({
    search: query,
    limit: String(limit),
  });
  return res.products;
}

export function useProductSearch(
  query: string,
  options: UseProductSearchOptions = {}
) {
  const normalizedQuery = query.trim();
  const debouncedQuery = useDebouncedValue(normalizedQuery, options.debounceMs ?? 250);
  const limit = options.limit ?? 5;
  const enabled = (options.enabled ?? true) && debouncedQuery.length >= 2;
  const isSettling = (options.enabled ?? true) && normalizedQuery.length >= 2 && normalizedQuery !== debouncedQuery;

  const queryResult = useQuery({
    queryKey: ["product-search", debouncedQuery, limit],
    queryFn: () => fetchProductSearch(debouncedQuery, limit),
    enabled,
    retry: false,
  });

  return {
    ...queryResult,
    normalizedQuery,
    debouncedQuery,
    isSettling,
  };
}
