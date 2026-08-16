"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { User, Package, Heart, LogOut } from "lucide-react";
import { useAuthStore } from "@/store/auth.store";
import { useWishlistStore } from "@/store/wishlist.store";
import { authService } from "@/services/auth.service";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

export function UserMenu() {
  const { user, isAuthenticated, logout } = useAuthStore();
  const clearWishlist = useWishlistStore((s) => s.clearWishlist);
  const router = useRouter();

  const handleSignOut = async () => {
    try {
      await authService.logout();
    } catch {
      // Ignore — local session is cleared regardless
    }
    logout();
    clearWishlist();
    router.push("/");
  };

  if (!isAuthenticated || !user) return null;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className="flex items-center gap-2 rounded-full p-2 text-ink/70 transition-colors hover:text-ink hover:bg-ink/[0.04] outline-none"
          aria-label="Account menu"
        >
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-100">
            {user.avatar ? (
              <Image
                src={user.avatar}
                alt={user.username}
                width={32}
                height={32}
                unoptimized
                className="h-8 w-8 rounded-full object-cover"
              />
            ) : (
              <User className="h-4 w-4 text-brand-500" />
            )}
          </div>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        sideOffset={8}
        className="z-[100] min-w-[220px] bg-white shadow-lg border rounded-xl p-1.5"
      >
        <DropdownMenuLabel>
          <div className="flex flex-col">
            <span className="font-medium text-sm">{user.username}</span>
            {user.email && (
              <span className="font-normal text-xs text-ink/50 truncate">
                {user.email}
              </span>
            )}
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href="/profile" className="flex items-center gap-3 cursor-pointer">
            <User className="h-4 w-4" />
            My Profile
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/orders" className="flex items-center gap-3 cursor-pointer">
            <Package className="h-4 w-4" />
            My Orders
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/wishlist" className="flex items-center gap-3 cursor-pointer">
            <Heart className="h-4 w-4" />
            Wishlist
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={handleSignOut}
          className="flex items-center gap-3 text-red-500 focus:text-red-600 cursor-pointer"
        >
          <LogOut className="h-4 w-4" />
          Sign Out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}


