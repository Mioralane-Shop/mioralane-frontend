import api from "@/lib/axios";
import type { Product } from "@/types/product";

export interface WishlistResponse {
  success: boolean;
  productIds: string[];
  products: Product[];
  isWishlisted?: boolean;
  message?: string;
}

export const wishlistService = {
  get: async (): Promise<WishlistResponse> => {
    const { data } = await api.get<WishlistResponse>("/wishlist");
    return data;
  },

  toggle: async (
    productId: string,
    itemType: "product" | "combo" = "product"
  ): Promise<WishlistResponse> => {
    const { data } = await api.post<WishlistResponse>("/wishlist/toggle", {
      productId,
      itemType,
    });
    return data;
  },
};
