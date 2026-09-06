"use client";

import { useQuery } from "@tanstack/react-query";
import { productService } from "@/services/product.service";
import type { Product } from "@/types/product";
import type { PaginatedProductsResponse } from "@/services/product.service";

async function fetchProducts(
  filters?: Record<string, string>
): Promise<PaginatedProductsResponse> {
  return productService.getAll(filters);
}

async function fetchProductBySlug(slug: string): Promise<Product> {
  return productService.getBySlug(slug);
}

async function fetchRelatedProducts(
  category: string,
  excludeId: string
): Promise<Product[]> {
  return productService.getRelated(category, excludeId);
}

async function fetchProductsByTab(
  tab: "bestseller" | "new" | "trending",
  limit = 8
): Promise<Product[]> {
  const res = await productService.getByTab(tab, limit);
  return res.products;
}

export function useProducts(filters?: Record<string, string>) {
  return useQuery({
    queryKey: ["products", filters],
    queryFn: () => fetchProducts(filters),
    retry: false,
  });
}

export function useProduct(slug: string) {
  return useQuery({
    queryKey: ["product", slug],
    queryFn: () => fetchProductBySlug(slug),
    enabled: !!slug,
    retry: false,
  });
}

export function useRelatedProducts(category: string, excludeId: string) {
  return useQuery({
    queryKey: ["related-products", category, excludeId],
    queryFn: () => fetchRelatedProducts(category, excludeId),
    enabled: !!category,
    retry: false,
  });
}

/** Hook: fetch products by tab - bestsellers, new arrivals, or trending */
export function useProductsByTab(
  tab: "bestseller" | "new" | "trending",
  limit = 8
) {
  return useQuery({
    queryKey: ["products", "tab", tab, limit],
    queryFn: () => fetchProductsByTab(tab, limit),
    retry: false,
  });
}

export function useBestSellers() {
  return useQuery({
    queryKey: ["best-sellers"],
    queryFn: async () => {
      const res = await productService.getByTab("bestseller");
      return res.products;
    },
    retry: false,
  });
}

export function useNewArrivals() {
  return useQuery({
    queryKey: ["new-arrivals"],
    queryFn: async () => {
      const res = await productService.getByTab("new");
      return res.products;
    },
    retry: false,
  });
}
