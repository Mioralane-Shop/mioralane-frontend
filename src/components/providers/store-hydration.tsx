"use client";

import { useEffect } from "react";
import { useCartStore } from "@/store/cart.store";
import { useAuthStore } from "@/store/auth.store";
import { useWishlistStore } from "@/store/wishlist.store";

/**
 * Rehydrates persisted zustand stores after mount.
 * Cart store uses `skipHydration: true` and needs manual rehydrate.
 * Auth store restores the cookie-backed session on mount.
 */
export function StoreHydration() {
  const { initializeAuth, isAuthenticated, _ready } = useAuthStore();

  useEffect(() => {
    void initializeAuth();
    void Promise.resolve(useCartStore.persist.rehydrate()).finally(() => {
      void useCartStore.getState().syncCatalog();
    });
    useWishlistStore.persist.rehydrate();
  }, [initializeAuth]);

  useEffect(() => {
    if (!_ready) return;

    if (isAuthenticated) {
      useWishlistStore.getState().fetchWishlist().catch(() => {
        // Individual wishlist actions surface errors in their own UI/toasts.
      });
      return;
    }

    useWishlistStore.getState().clearWishlist();
  }, [_ready, isAuthenticated]);

  return null;
}
