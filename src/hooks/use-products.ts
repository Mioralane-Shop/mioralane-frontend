"use client";

import { useQuery } from "@tanstack/react-query";
import { productService } from "@/services/product.service";
import { DUMMY_PRODUCTS } from "@/constants/site";
import type { Product } from "@/types/product";

const USE_DUMMY = !process.env.NEXT_PUBLIC_API_URL;

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function fetchProducts(): Promise<Product[]> {
  if (USE_DUMMY) {
    await delay(600);
    return DUMMY_PRODUCTS;
  }
  return productService.getAll();
}

async function fetchProductBySlug(slug: string): Promise<Product | undefined> {
  if (USE_DUMMY) {
    await delay(400);
    return DUMMY_PRODUCTS.find((p) => p.slug === slug);
  }
  return productService.getBySlug(slug);
}

async function fetchRelatedProducts(
  category: string,
  excludeId: string
): Promise<Product[]> {
  if (USE_DUMMY) {
    await delay(300);
    return DUMMY_PRODUCTS.filter(
      (p) => p.category === category && p.id !== excludeId
    ).slice(0, 4);
  }
  return productService.getRelated(category, excludeId);
}

export function useProducts(filters?: Record<string, string>) {
  return useQuery({
    queryKey: ["products", filters],
    queryFn: fetchProducts,
  });
}

export function useProduct(slug: string) {
  return useQuery({
    queryKey: ["product", slug],
    queryFn: () => fetchProductBySlug(slug),
    enabled: !!slug,
  });
}

export function useRelatedProducts(category: string, excludeId: string) {
  return useQuery({
    queryKey: ["related-products", category, excludeId],
    queryFn: () => fetchRelatedProducts(category, excludeId),
    enabled: !!category,
  });
}

export function useBestSellers() {
  return useQuery({
    queryKey: ["best-sellers"],
    queryFn: async () => {
      if (USE_DUMMY) {
        await delay(500);
        return DUMMY_PRODUCTS.filter((p) => p.isBestSeller);
      }
      return productService.getAll({ sort: "best-seller" });
    },
  });
}

export function useNewArrivals() {
  return useQuery({
    queryKey: ["new-arrivals"],
    queryFn: async () => {
      if (USE_DUMMY) {
        await delay(500);
        return DUMMY_PRODUCTS.filter((p) => p.isNew);
      }
      return productService.getAll({ sort: "newest" });
    },
  });
}
