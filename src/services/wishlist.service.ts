import api from "@/lib/axios";
import type { WishlistItemType, WishlistResponse, WishlistSort } from "@/types/wishlist";

// Re-exported for existing imports of the response type.
export type { WishlistResponse };

export const wishlistService = {
  get: async (sort?: WishlistSort): Promise<WishlistResponse> => {
    const { data } = await api.get<WishlistResponse>("/wishlist", {
      params: sort ? { sort } : undefined,
    });
    return data;
  },

  /** Idempotent — saving an already-saved item keeps its original saved price. */
  add: async (
    itemId: string,
    itemType: WishlistItemType = "product"
  ): Promise<WishlistResponse> => {
    const { data } = await api.post<WishlistResponse>("/wishlist", { itemId, itemType });
    return data;
  },

  remove: async (itemId: string, itemType?: WishlistItemType): Promise<WishlistResponse> => {
    const { data } = await api.delete<WishlistResponse>(`/wishlist/${itemId}`, {
      params: itemType ? { itemType } : undefined,
    });
    return data;
  },

  toggle: async (
    itemId: string,
    itemType: WishlistItemType = "product"
  ): Promise<WishlistResponse> => {
    const { data } = await api.post<WishlistResponse>("/wishlist/toggle", {
      itemId,
      itemType,
    });
    return data;
  },
};
