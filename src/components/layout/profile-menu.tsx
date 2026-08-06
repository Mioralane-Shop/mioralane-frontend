"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuthStore } from "@/store/auth.store";
import { authService } from "@/services/auth.service";

export function ProfileMenu() {
  const { user, isAuthenticated, logout } = useAuthStore();
  const router = useRouter();

  // Logged out: only the "Sign In" button → routes to /login
  if (!isAuthenticated) {
    return (
      <Button
        asChild
        variant="outline"
        size="sm"
        className="rounded-full border-border-light text-ink-soft hover:text-accent"
      >
        <Link href="/login">Sign In</Link>
      </Button>
    );
  }

  const initial = (user?.username?.[0] ?? "U").toUpperCase();

  const handleSignOut = async () => {
    try {
      // End the session server-side first.
      await authService.logout();
    } catch {
      // Network/API errors shouldn't strand the user — still clear locally.
    } finally {
      logout();
      router.push("/");
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          aria-label="Account menu"
          className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-brand-400 to-brand-500 text-sm font-semibold text-white shadow-sm ring-1 ring-brand-100 transition-transform duration-200 hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2"
        >
          {initial}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-60">
        <DropdownMenuLabel className="font-normal">
          <p className="truncate font-semibold text-ink">
            {user?.username ?? "Member"}
          </p>
          <p className="text-xs font-normal text-ink-muted">
            Mioralane member
          </p>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href="/profile">My Profile</Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/orders">My Orders</Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onSelect={handleSignOut}
          className="text-red-500 focus:bg-red-50 focus:text-red-600"
        >
          Sign Out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
