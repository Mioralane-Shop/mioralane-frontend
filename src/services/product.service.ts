import api from "@/lib/axios";
import type { Product } from "@/types/product";

export const productService = {
  getAll: async (params?: Record<string, string>) => {
    const { data } = await api.get<Product[]>("/products", { params });
    return data;
  },

  getBySlug: async (slug: string) => {
    const { data } = await api.get<Product>(`/products/${slug}`);
    return data;
  },

  getFeatured: async () => {
    const { data } = await api.get<Product[]>("/products/featured");
    return data;
  },

  getRelated: async (category: string, excludeId: string) => {
    const { data } = await api.get<Product[]>("/products/related", {
      params: { category, excludeId },
    });
    return data;
  },
};
