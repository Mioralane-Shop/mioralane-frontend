"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { SITE_NAME, NAV_LINKS, CATEGORIES } from "@/constants/site";
import { useAuthStore } from "@/store/auth.store";
import { useState } from "react";
import { Menu } from "lucide-react";

export function MobileMenu() {
  const [open, setOpen] = useState(false);
  const { isAuthenticated, logout } = useAuthStore();

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <Button
        variant="ghost"
        size="icon"
        className="md:hidden"
        onClick={() => setOpen(true)}
        aria-label="Open menu"
      >
        <Menu className="h-5 w-5" />
      </Button>
      <SheetContent side="left" className="w-[280px] p-0">
        <div className="flex h-full flex-col">
          <SheetHeader className="border-b border-rose-100 p-4">
            <SheetTitle className="text-xl font-light text-rose-600">
              {SITE_NAME}
            </SheetTitle>
          </SheetHeader>

          <div className="flex-1 overflow-y-auto p-4">
            <nav className="flex flex-col gap-1">
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className="rounded-lg px-3 py-2.5 text-sm font-medium text-neutral-700 transition-colors hover:bg-rose-50 hover:text-rose-600"
                >
                  {link.label}
                </Link>
              ))}
            </nav>

            <div className="mt-6">
              <h4 className="mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-neutral-400">
                Categories
              </h4>
              <nav className="flex flex-col gap-1">
                {CATEGORIES.map((cat) => (
                  <Link
                    key={cat.id}
                    href={`/shop?category=${cat.slug}`}
                    onClick={() => setOpen(false)}
                    className="rounded-lg px-3 py-2 text-sm text-neutral-600 transition-colors hover:bg-rose-50 hover:text-rose-600"
                  >
                    {cat.name}
                  </Link>
                ))}
              </nav>
            </div>
          </div>

          <div className="border-t border-rose-100 p-4">
            {isAuthenticated ? (
              <div className="flex flex-col gap-2">
                <Link
                  href="/profile"
                  onClick={() => setOpen(false)}
                  className="text-sm font-medium text-neutral-700 hover:text-rose-600"
                >
                  My Profile
                </Link>
                <Link
                  href="/orders"
                  onClick={() => setOpen(false)}
                  className="text-sm font-medium text-neutral-700 hover:text-rose-600"
                >
                  My Orders
                </Link>
                <Button
                  variant="ghost"
                  className="justify-start px-0 text-sm text-neutral-500"
                  onClick={() => {
                    logout();
                    setOpen(false);
                  }}
                >
                  Sign Out
                </Button>
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                <Link href="/login" onClick={() => setOpen(false)}>
                  <Button variant="outline" className="w-full">
                    Sign In
                  </Button>
                </Link>
                <Link href="/register" onClick={() => setOpen(false)}>
                  <Button className="w-full">Create Account</Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
