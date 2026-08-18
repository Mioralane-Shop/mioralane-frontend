import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { CartItem, Product } from "@/types/product";

function clampQuantity(quantity: number, stock: number) {
  if (stock <= 0) {
    return 1;
  }

  return Math.max(1, Math.min(quantity, stock));
}

interface CartState {
  items: CartItem[];
  isOpen: boolean;
  addItem: (product: Product, quantity?: number) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  syncItemStock: (productId: string, stock: number) => void;
  clearCart: () => void;
  toggleCart: () => void;
  closeCart: () => void;
  totalItems: () => number;
  totalPrice: () => number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,

      addItem: (product, quantity = 1) => {
        if (product.stock <= 0) {
          return;
        }

        const normalizedQuantity = clampQuantity(quantity, product.stock);
        set((state) => {
          const existing = state.items.find(
            (item) => item.product.id === product.id,
          );
          if (existing) {
            const nextQuantity = clampQuantity(
              existing.quantity + normalizedQuantity,
              product.stock,
            );

            return {
              items: state.items.map((item) =>
                item.product.id === product.id
                  ? { ...item, quantity: nextQuantity }
                  : item,
              ),
              isOpen: true,
            };
          }
          return {
            items: [...state.items, { product, quantity: normalizedQuantity }],
            isOpen: true,
          };
        });
      },

      removeItem: (productId) => {
        set((state) => ({
          items: state.items.filter((item) => item.product.id !== productId),
        }));
      },

      updateQuantity: (productId, quantity) => {
        const item = get().items.find((entry) => entry.product.id === productId);
        if (!item) {
          return;
        }

        const nextQuantity = clampQuantity(quantity, item.product.stock);
        set((state) => ({
          items: state.items.map((item) =>
            item.product.id === productId
              ? { ...item, quantity: nextQuantity }
              : item,
          ),
        }));
      },

      syncItemStock: (productId, stock) => {
        set((state) => {
          let didChange = false;
          const items = state.items.map((item) => {
            if (item.product.id !== productId) {
              return item;
            }

            const nextQuantity = clampQuantity(item.quantity, stock);
            const nextProduct =
              item.product.stock === stock ? item.product : { ...item.product, stock };

            if (nextQuantity === item.quantity && nextProduct === item.product) {
              return item;
            }

            didChange = true;
            return {
              ...item,
              product: nextProduct,
              quantity: nextQuantity,
            };
          });

          return didChange ? { items } : {};
        });
      },

      clearCart: () => set({ items: [] }),

      toggleCart: () => set((state) => ({ isOpen: !state.isOpen })),

      closeCart: () => set({ isOpen: false }),

      totalItems: () =>
        get().items.reduce((sum, item) => sum + item.quantity, 0),

      totalPrice: () =>
        get().items.reduce(
          (sum, item) => sum + item.product.price * item.quantity,
          0,
        ),
    }),
    {
      name: "mioralane-cart",
      storage: createJSONStorage(() => localStorage),
      skipHydration: true,
    },
  ),
);
