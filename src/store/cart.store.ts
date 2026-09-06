import { isAxiosError } from "axios";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { comboService } from "@/services/combo.service";
import { productService } from "@/services/product.service";
import type { CartCatalogStatus, CartItem, Product } from "@/types/product";

type CartItemType = "product" | "combo";
type CartSyncResult =
  | {
      key: string;
      status: "verified";
      product: Product;
      quantity: number;
    }
  | {
      key: string;
      status: "missing" | "error";
      message: string;
    };

let catalogSyncPromise: Promise<void> | null = null;

export function clampQuantity(quantity: number, stock: number) {
  if (stock <= 0) {
    return 1;
  }

  return Math.max(1, Math.min(quantity, stock));
}

export function getCartItemType(product: Product): CartItemType {
  return product.itemType ?? (product.category === "combo" ? "combo" : "product");
}

function getCartItemKey(item: CartItem): string {
  const itemType = getCartItemType(item.product);
  const sourceId = item.product.id || item.product.slug;
  return `${itemType}:${sourceId}`;
}

function getCartItemTypeLabel(itemType: CartItemType) {
  return itemType === "combo" ? "bundle" : "product";
}

function isPurchasableItem(item: CartItem): boolean {
  if (item.catalogStatus !== "verified") {
    return false;
  }

  return item.product.stock > 0 && item.quantity <= item.product.stock;
}

function getCatalogStatusMessage(
  status: CartCatalogStatus,
  itemType: CartItemType,
): string {
  if (status === "missing") {
    return `This ${getCartItemTypeLabel(itemType)} is no longer available.`;
  }

  return "We could not verify the current availability for this item.";
}

function getHttpStatus(error: unknown): number | undefined {
  if (isAxiosError(error)) {
    return error.response?.status;
  }

  if (typeof error === "object" && error && "response" in error) {
    const response = (error as { response?: { status?: number } }).response;
    return response?.status;
  }

  return undefined;
}

function syncItemFromCatalog(
  item: CartItem,
  catalogProduct: Product,
): CartItem {
  const itemType = getCartItemType(item.product);
  const nextProduct = {
    ...catalogProduct,
    itemType,
  };
  const nextQuantity =
    catalogProduct.stock > 0
      ? clampQuantity(item.quantity, catalogProduct.stock)
      : item.quantity;

  return {
    ...item,
    product: nextProduct,
    quantity: nextQuantity,
    catalogStatus: "verified",
    catalogMessage: undefined,
  };
}

interface CartState {
  items: CartItem[];
  isOpen: boolean;
  isSyncingCatalog: boolean;
  catalogSyncError: string | null;
  addItem: (product: Product, quantity?: number) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  syncItemStock: (productId: string, stock: number) => void;
  syncCatalog: () => Promise<void>;
  clearCart: () => void;
  toggleCart: () => void;
  closeCart: () => void;
  totalItems: () => number;
  totalPrice: () => number;
  canCheckout: () => boolean;
  getCheckoutBlockMessage: () => string | null;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,
      isSyncingCatalog: false,
      catalogSyncError: null,

      addItem: (product, quantity = 1) => {
        if (product.stock <= 0) {
          return;
        }

        const itemType = getCartItemType(product);
        const normalizedQuantity = clampQuantity(quantity, product.stock);
        const normalizedProduct: Product = {
          ...product,
          itemType,
        };

        set((state) => {
          const existingIndex = state.items.findIndex(
            (item) => getCartItemKey(item) === `${itemType}:${product.id || product.slug}`,
          );

          if (existingIndex >= 0) {
            const existing = state.items[existingIndex];
            const nextQuantity = clampQuantity(
              existing.quantity + normalizedQuantity,
              product.stock,
            );

            const nextItems = [...state.items];
            nextItems[existingIndex] = {
              ...existing,
              product: normalizedProduct,
              quantity: nextQuantity,
              catalogStatus: "verified",
              catalogMessage: undefined,
            };

            return {
              items: nextItems,
              isOpen: true,
            };
          }

          return {
            items: [
              ...state.items,
              {
                product: normalizedProduct,
                quantity: normalizedQuantity,
                catalogStatus: "verified",
                catalogMessage: undefined,
              },
            ],
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
          items: state.items.map((entry) =>
            entry.product.id === productId
              ? { ...entry, quantity: nextQuantity }
              : entry,
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

            const nextProduct =
              item.product.stock === stock ? item.product : { ...item.product, stock };
            const nextQuantity =
              stock > 0 ? clampQuantity(item.quantity, stock) : item.quantity;
            const nextItem: CartItem = {
              ...item,
              product: nextProduct,
              quantity: nextQuantity,
              catalogStatus: "verified",
              catalogMessage: undefined,
            };

            if (
              nextItem.product === item.product &&
              nextItem.quantity === item.quantity &&
              nextItem.catalogStatus === item.catalogStatus &&
              nextItem.catalogMessage === item.catalogMessage
            ) {
              return item;
            }

            didChange = true;
            return nextItem;
          });

          return didChange ? { items } : {};
        });
      },

      syncCatalog: async () => {
        if (catalogSyncPromise) {
          return catalogSyncPromise;
        }

        catalogSyncPromise = (async () => {
          const snapshot = get().items;

          if (snapshot.length === 0) {
            set({ isSyncingCatalog: false, catalogSyncError: null });
            return;
          }

          set({ isSyncingCatalog: true, catalogSyncError: null });

          const results: CartSyncResult[] = await Promise.all(
            snapshot.map(async (item) => {
              const itemType = getCartItemType(item.product);
              const sourceId = item.product.id || item.product.slug;

              if (!sourceId) {
                return {
                  key: getCartItemKey(item),
                  status: "error",
                  message: getCatalogStatusMessage("error", itemType),
                } as const;
              }

              try {
                const catalogProduct =
                  itemType === "combo"
                    ? await comboService.getBySlug(sourceId)
                    : await productService.getBySlug(sourceId);

                return {
                  key: getCartItemKey(item),
                  status: "verified",
                  product: catalogProduct,
                  quantity:
                    catalogProduct.stock > 0
                      ? clampQuantity(item.quantity, catalogProduct.stock)
                      : item.quantity,
                } as const;
              } catch (error) {
                const status = getHttpStatus(error);
                const isMissing = status === 404;
                return {
                  key: getCartItemKey(item),
                  status: isMissing ? "missing" : "error",
                  message: getCatalogStatusMessage(
                    isMissing ? "missing" : "error",
                    itemType,
                  ),
                } as const;
              }
            }),
          );

          const resultMap = new Map(results.map((result) => [result.key, result]));
          const hasError = results.some((result) => result.status === "error");

          set((state) => ({
            items: state.items.map((item) => {
              const result = resultMap.get(getCartItemKey(item));

              if (!result) {
                return item;
              }

              if (result.status === "verified") {
                return syncItemFromCatalog(item, result.product);
              }

              return {
                ...item,
                catalogStatus: result.status,
                catalogMessage: result.message,
              };
            }),
            isSyncingCatalog: false,
            catalogSyncError: hasError
              ? "One or more cart items could not be verified."
              : null,
          }));
        })().finally(() => {
          catalogSyncPromise = null;
        });

        return catalogSyncPromise;
      },

      clearCart: () => set({ items: [] }),

      toggleCart: () => set((state) => ({ isOpen: !state.isOpen })),

      closeCart: () => set({ isOpen: false }),

      totalItems: () =>
        get().items.reduce((sum, item) => sum + item.quantity, 0),

      totalPrice: () =>
        get().items.reduce((sum, item) => {
          if (!isPurchasableItem(item)) {
            return sum;
          }

          return sum + item.product.price * item.quantity;
        }, 0),

      canCheckout: () => {
        const state = get();

        if (state.isSyncingCatalog) {
          return false;
        }

        return (
          state.items.length > 0 &&
          state.items.every((item) => isPurchasableItem(item))
        );
      },

      getCheckoutBlockMessage: () => {
        const state = get();

        if (state.items.length === 0) {
          return "Your cart is empty.";
        }

        if (state.isSyncingCatalog) {
          return "Refreshing cart prices and stock. Please wait a moment.";
        }

        const missingItem = state.items.find((item) => item.catalogStatus === "missing");
        if (missingItem) {
          const itemType = getCartItemType(missingItem.product);
          return `One ${getCartItemTypeLabel(itemType)} in your cart is no longer available. Remove it before placing the order.`;
        }

        const errorItem = state.items.find((item) => item.catalogStatus === "error");
        if (errorItem) {
          return "We could not verify the current availability of one or more cart items. Please try again.";
        }

        const outOfStockItem = state.items.find(
          (item) => item.catalogStatus === "verified" && item.product.stock <= 0,
        );
        if (outOfStockItem) {
          return "One or more items in your cart are currently out of stock.";
        }

        const overLimitItem = state.items.find(
          (item) => item.catalogStatus === "verified" && item.quantity > item.product.stock,
        );
        if (overLimitItem) {
          return "One or more items exceed the current stock level.";
        }

        const pendingItem = state.items.find((item) => !item.catalogStatus);
        if (pendingItem) {
          return "We are still verifying cart availability. Please wait a moment.";
        }

        return null;
      },
    }),
    {
      name: "mioralane-cart",
      storage: createJSONStorage(() => localStorage),
      skipHydration: true,
      partialize: (state) => ({
        items: state.items.map((item) => ({
          product: item.product,
          quantity: item.quantity,
        })),
        isOpen: state.isOpen,
      }),
    },
  ),
);
