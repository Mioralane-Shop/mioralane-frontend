"use client";

import { useRouter } from "next/navigation";
import { authService } from "@/services/auth.service";
import { useAuthStore } from "@/store/auth.store";
import { useToastStore } from "@/store/toast.store";
import { useWishlistStore } from "@/store/wishlist.store";

export function useAccountLogout() {
  const router = useRouter();
  const logout = useAuthStore((state) => state.logout);
  const clearWishlist = useWishlistStore((state) => state.clearWishlist);
  const addToast = useToastStore((state) => state.addToast);

  return async (redirectTo = "/") => {
    try {
      await authService.logout();
    } catch {
      addToast("Unable to sign out right now. Please try again.", "error");
      return false;
    }

    logout();
    clearWishlist();
    router.push(redirectTo);
    return true;
  };
}
