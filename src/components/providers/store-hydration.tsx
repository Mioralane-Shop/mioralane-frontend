"use client";

import { useEffect } from "react";
import { useCartStore } from "@/store/cart.store";

/**
 * Rehydrates persisted zustand stores after mount.
 * Cart store uses `skipHydration: true` — needs manual rehydrate.
 * Auth store auto-initializes via `onRehydrateStorage` callback — no manual call needed.
 */
export function StoreHydration() {
  useEffect(() => {
    useCartStore.persist.rehydrate();
  }, []);
  return null;
}
