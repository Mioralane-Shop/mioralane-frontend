"use client";

import { useEffect } from "react";
import { useCartStore } from "@/store/cart.store";
import { useAuthStore } from "@/store/auth.store";
import { useWishlistStore } from "@/store/wishlist.store";

/**
 * Rehydrates persisted zustand stores after mount.
 * Cart store uses `skipHydration: true` — needs manual rehydrate.
 * Auth store auto-initializes via `onRehydrateStorage` callback — no manual call needed.
 */
export function StoreHydration() {
  const { isAuthenticated, _ready } = useAuthStore();

  useEffect(() => {
    useCartStore.persist.rehydrate();
  }, []);

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
