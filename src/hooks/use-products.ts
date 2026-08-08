"use client";

import { useQuery } from "@tanstack/react-query";
import { productService } from "@/services/product.service";
import { DUMMY_PRODUCTS } from "@/constants/site";
import type { Product } from "@/types/product";

const USE_DUMMY = !process.env.NEXT_PUBLIC_API_URL;

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// ─── API fetch helpers ────────────────────────────────────────────────────

async function fetchProducts(filters?: Record<string, string>): Promise<Product[]> {
  if (USE_DUMMY) {
    await delay(600);
    let filtered = [...DUMMY_PRODUCTS];
    if (filters?.tab === "bestseller") filtered = filtered.filter((p) => p.isBestSeller);
    else if (filters?.tab === "new") filtered = filtered.filter((p) => p.isNew);
    return filtered;
  }
  const res = await productService.getAll(filters);
  return res.products;
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

async function fetchProductsByTab(
  tab: "bestseller" | "new" | "trending",
  limit = 8
): Promise<Product[]> {
  if (USE_DUMMY) {
    await delay(500);
    let filtered = [...DUMMY_PRODUCTS];
    if (tab === "bestseller") filtered = filtered.filter((p) => p.isBestSeller);
    else if (tab === "new") filtered = filtered.filter((p) => p.isNew);
    // trending: show all for now (no isTrending in dummy data)
    return filtered.slice(0, limit);
  }
  const res = await productService.getByTab(tab, limit);
  return res.products;
}

// ─── Hooks ────────────────────────────────────────────────────────────────

export function useProducts(filters?: Record<string, string>) {
  return useQuery({
    queryKey: ["products", filters],
    queryFn: () => fetchProducts(filters),
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

/** Hook: fetch products by tab — bestsellers, new arrivals, or trending */
export function useProductsByTab(
  tab: "bestseller" | "new" | "trending",
  limit = 8
) {
  return useQuery({
    queryKey: ["products", "tab", tab, limit],
    queryFn: () => fetchProductsByTab(tab, limit),
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
      const res = await productService.getByTab("bestseller");
      return res.products;
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
      const res = await productService.getByTab("new");
      return res.products;
    },
  });
}
