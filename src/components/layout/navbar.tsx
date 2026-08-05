"use client";

import Link from "next/link";
import { ShoppingBag, Search, User, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCartStore } from "@/store/cart.store";
import { useAuthStore } from "@/store/auth.store";
import { SITE_NAME, NAV_LINKS } from "@/constants/site";
import { MobileMenu } from "./mobile-menu";

export function Navbar() {
  const { toggleCart, totalItems } = useCartStore();
  const { isAuthenticated } = useAuthStore();

  return (
    <header className="sticky top-0 z-40 w-full border-b border-rose-100 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/80">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-6">
          <MobileMenu />
          <Link
            href="/"
            className="text-2xl font-light tracking-wide text-rose-600"
          >
            {SITE_NAME}
          </Link>
        </div>

        <nav className="hidden md:flex items-center gap-8">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-neutral-600 transition-colors hover:text-rose-500"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" aria-label="Search">
            <Search className="h-5 w-5" />
          </Button>

          <Button variant="ghost" size="icon" aria-label="Wishlist">
            <Heart className="h-5 w-5" />
          </Button>

          <Link href={isAuthenticated ? "/profile" : "/login"}>
            <Button variant="ghost" size="icon" aria-label="Account">
              <User className="h-5 w-5" />
            </Button>
          </Link>

          <Button
            variant="ghost"
            size="icon"
            className="relative"
            onClick={toggleCart}
            aria-label="Cart"
          >
            <ShoppingBag className="h-5 w-5" />
            {totalItems() > 0 && (
              <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-rose-400 text-[10px] font-medium text-white">
                {totalItems()}
              </span>
            )}
          </Button>
        </div>
      </div>
    </header>
  );
}
