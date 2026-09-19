import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { wishlistService } from "@/services/wishlist.service";
import { getCartItemType, useCartStore } from "@/store/cart.store";
import { isPurchasableProduct } from "@/lib/pre-order";
import type { Product } from "@/types/product";
import type { WishlistEntry, WishlistItemType, WishlistResponse, WishlistSort } from "@/types/wishlist";

const DEFAULT_WISHLIST_SORT: WishlistSort = "newest";

interface WishlistState {
  productIds: string[];
  products: Product[];
  items: WishlistEntry[];
  sort: WishlistSort;
  isLoading: boolean;
  isToggling: string | null;
  movingItemId: string | null;
  error: string | null;
  initialized: boolean;
  isWishlisted: (productId: string) => boolean;
  fetchWishlist: (sort?: WishlistSort) => Promise<void>;
  setSort: (sort: WishlistSort) => Promise<void>;
  toggleWishlist: (productId: string, itemType?: WishlistItemType) => Promise<boolean>;
  removeItem: (itemId: string, itemType?: WishlistItemType) => Promise<void>;
  moveToCart: (entry: WishlistEntry) => Promise<boolean>;
  addToWishlist: (productId: string) => void;
  removeFromWishlist: (productId: string) => void;
  clearWishlist: () => void;
  count: () => number;
}

const getErrorMessage = (error: unknown, fallback: string) =>
  error instanceof Error ? error.message : fallback;

/** The API always answers with a fresh snapshot, so every mutation syncs from it. */
const toSnapshot = (response: WishlistResponse) => ({
  productIds: response.productIds ?? [],
  products: response.products ?? [],
  items: response.items ?? [],
  ...(response.sort ? { sort: response.sort } : {}),
});

export const useWishlistStore = create<WishlistState>()(
  persist(
    (set, get) => ({
      productIds: [],
      products: [],
      items: [],
      sort: DEFAULT_WISHLIST_SORT,
      isLoading: false,
      isToggling: null,
      movingItemId: null,
      error: null,
      initialized: false,

      isWishlisted: (productId) => get().productIds.includes(productId),

      fetchWishlist: async (sort) => {
        set({ isLoading: true, error: null });
        try {
          const wishlist = await wishlistService.get(sort ?? get().sort);
          set({
            ...toSnapshot(wishlist),
            isLoading: false,
            initialized: true,
          });
        } catch (error) {
          set({
            error: getErrorMessage(error, "Unable to load wishlist"),
            isLoading: false,
            initialized: true,
          });
          throw error;
        }
      },

      setSort: async (sort) => {
        set({ sort });
        await get().fetchWishlist(sort);
      },

      toggleWishlist: async (productId, itemType = "product") => {
        set({ isToggling: productId, error: null });
        try {
          const wishlist = await wishlistService.toggle(productId, itemType);
          set({
            ...toSnapshot(wishlist),
            isToggling: null,
            initialized: true,
          });
          return Boolean(wishlist.isWishlisted);
        } catch (error) {
          set({ error: getErrorMessage(error, "Unable to update wishlist"), isToggling: null });
          throw error;
        }
      },

      removeItem: async (itemId, itemType) => {
        set({ isToggling: itemId, error: null });
        try {
          const wishlist = await wishlistService.remove(itemId, itemType);
          set({ ...toSnapshot(wishlist), isToggling: null });
        } catch (error) {
          set({
            error: getErrorMessage(error, "Unable to remove this item"),
            isToggling: null,
          });
          throw error;
        }
      },

      /**
       * Adds the item through the existing cart store (which enforces stock and
       * clamps quantity) and only then removes it from the wishlist. If the cart
       * refuses the item it stays saved.
       */
      moveToCart: async (entry) => {
        const cartProduct: Product = { ...entry.product, itemType: entry.itemType };

        if (!entry.isAvailable || !isPurchasableProduct(cartProduct)) {
          return false;
        }

        set({ movingItemId: entry.itemId, error: null });

        try {
          useCartStore.getState().addItem(cartProduct, 1);

          const wasAdded = useCartStore.getState().items.some(
            (item) =>
              (item.itemId || item.product.id) === entry.itemId &&
              (item.itemType ?? getCartItemType(item.product)) === entry.itemType
          );

          if (!wasAdded) {
            set({ movingItemId: null });
            return false;
          }

          const wishlist = await wishlistService.remove(entry.itemId, entry.itemType);
          set({ ...toSnapshot(wishlist), movingItemId: null });
          return true;
        } catch (error) {
          set({
            error: getErrorMessage(error, "Unable to move this item to your cart"),
            movingItemId: null,
          });
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
          items: state.items.filter((item) => item.itemId !== productId),
        }));
      },

      clearWishlist: () =>
        set({
          productIds: [],
          products: [],
          items: [],
          error: null,
          initialized: false,
          isToggling: null,
          movingItemId: null,
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
