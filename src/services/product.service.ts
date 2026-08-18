import api from "@/lib/axios";
import type { Product } from "@/types/product";

export interface PaginatedProductsResponse {
  success: boolean;
  count: number;
  totalProducts?: number;
  page: number;
  limit: number;
  totalPages: number;
  products: Product[];
}

export interface SingleProductResponse {
  success: boolean;
  product: Product;
}

export const productService = {
  getAll: async (params?: Record<string, string>): Promise<PaginatedProductsResponse> => {
    const { data } = await api.get<PaginatedProductsResponse>("/products", { params });
    return data;
  },

  getBySlug: async (slug: string): Promise<Product> => {
    const { data } = await api.get<SingleProductResponse>(`/products/${slug}`);
    return data.product;
  },

  getFeatured: async (): Promise<PaginatedProductsResponse> => {
    const { data } = await api.get<PaginatedProductsResponse>("/products", {
      params: { featured: "true", limit: "8" },
    });
    return data;
  },

  getRelated: async (category: string, excludeId: string): Promise<Product[]> => {
    const { data } = await api.get<PaginatedProductsResponse>("/products", {
      params: { category, limit: "4" },
    });
    return data.products.filter((p) => p.id !== excludeId).slice(0, 4);
  },

  /** Fetch products by a specific tab: bestsellers, new arrivals, or trending */
  getByTab: async (
    tab: "bestseller" | "new" | "trending",
    limit = 8
  ): Promise<PaginatedProductsResponse> => {
    const params: Record<string, string> = { limit: String(limit) };
    if (tab === "bestseller") params.tab = "bestseller";
    else if (tab === "new") params.tab = "new";
    else if (tab === "trending") params.tab = "trending";
    const { data } = await api.get<PaginatedProductsResponse>("/products", { params });
    return data;
  },
};
