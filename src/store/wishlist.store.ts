import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { wishlistService } from "@/services/wishlist.service";
import type { Product } from "@/types/product";

interface WishlistState {
  productIds: string[];
  products: Product[];
  isLoading: boolean;
  isToggling: string | null;
  error: string | null;
  initialized: boolean;
  isWishlisted: (productId: string) => boolean;
  fetchWishlist: () => Promise<void>;
  toggleWishlist: (productId: string, itemType?: "product" | "combo") => Promise<boolean>;
  addToWishlist: (productId: string) => void;
  removeFromWishlist: (productId: string) => void;
  clearWishlist: () => void;
  count: () => number;
}

export const useWishlistStore = create<WishlistState>()(
  persist(
    (set, get) => ({
      productIds: [],
      products: [],
      isLoading: false,
      isToggling: null,
      error: null,
      initialized: false,

      isWishlisted: (productId) => get().productIds.includes(productId),

      fetchWishlist: async () => {
        set({ isLoading: true, error: null });
        try {
          const wishlist = await wishlistService.get();
          set({
            productIds: wishlist.productIds,
            products: wishlist.products,
            isLoading: false,
            initialized: true,
          });
        } catch (error) {
          const message =
            error instanceof Error ? error.message : "Unable to load wishlist";
          set({ error: message, isLoading: false, initialized: true });
          throw error;
        }
      },

      toggleWishlist: async (productId, itemType = "product") => {
        set({ isToggling: productId, error: null });
        try {
          const wishlist = await wishlistService.toggle(productId, itemType);
          set({
            productIds: wishlist.productIds,
            products: wishlist.products,
            isToggling: null,
            initialized: true,
          });
          return Boolean(wishlist.isWishlisted);
        } catch (error) {
          const message =
            error instanceof Error ? error.message : "Unable to update wishlist";
          set({ error: message, isToggling: null });
          throw error;
        }
      },

      addToWishlist: (productId) => {
        set((state) => {
          if (state.productIds.includes(productId)) return state;
          return { productIds: [...state.productIds, productId] };
        });
      },

      removeFromWishlist: (productId) => {
        set((state) => ({
          productIds: state.productIds.filter((id) => id !== productId),
        }));
      },

      clearWishlist: () =>
        set({
          productIds: [],
          products: [],
          error: null,
          initialized: false,
          isToggling: null,
        }),

      count: () => get().productIds.length,
    }),
    {
      name: "mioralane-wishlist",
      storage: createJSONStorage(() => localStorage),
      skipHydration: true,
      partialize: (state) => ({
        productIds: state.productIds,
      }),
    }
  )
);
