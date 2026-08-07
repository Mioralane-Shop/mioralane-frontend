"use client";

import { useEffect } from "react";
import { useCartStore } from "@/store/cart.store";
import { useAuthStore } from "@/store/auth.store";

/**
 * Rehydrates persisted zustand stores after mount.
 * Persisted stores use `skipHydration: true` to avoid SSR hydration
 * mismatches (server renders empty state, client would restore earlier).
 */
export function StoreHydration() {
  useEffect(() => {
    useCartStore.persist.rehydrate();
    useAuthStore.persist.rehydrate();
  }, []);
  return null;
}
