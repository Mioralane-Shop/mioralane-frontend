"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ShoppingBag, Search, User, Heart, X } from "lucide-react";
import { useCartStore } from "@/store/cart.store";
import { useAuthStore } from "@/store/auth.store";
import { DUMMY_PRODUCTS } from "@/constants/site";

const BOTTOM_NAV = [
  { label: "Home", href: "/" },
  { label: "Products", href: "/shop" },
  { label: "Brands", href: "/shop" },
  { label: "Combo", href: "/shop?category=combo" },
  { label: "Offers", href: "/shop?sort=offers" },
  { label: "New Arrival", href: "/shop?sort=newest" },
  { label: "Best Seller", href: "/shop?sort=best-seller" },
  { label: "Blog", href: "/blog" },
];

export function Navbar() {
  const router = useRouter();
  const { toggleCart, totalItems } = useCartStore();
  const { isAuthenticated } = useAuthStore();
  const [scrolled, setScrolled] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchFocused, setSearchFocused] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  const searchResults =
    searchQuery.length >= 2
      ? DUMMY_PRODUCTS.filter((p) => {
          const q = searchQuery.toLowerCase();
          return (
            p.name.toLowerCase().includes(q) ||
            p.brand?.toLowerCase().includes(q) ||
            p.category?.toLowerCase().includes(q)
          );
        }).slice(0, 5)
      : [];

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/shop?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery("");
      setSearchFocused(false);
    }
  };

  useEffect(() => {
    let ticking = false;
    const handleScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          setScrolled(window.scrollY > 50);
          ticking = false;
        });
        ticking = true;
      }
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setSearchFocused(false);
      }
    };
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  return (
    <>
      {/* Spacer to prevent content jump */}
      <div className="h-[132px] md:h-[132px]" />

      {/* Top Row - slides up on scroll */}
      <div
        className={`fixed top-0 left-0 right-0 z-50 bg-white transition-transform duration-300 ease-in-out ${
          scrolled ? "-translate-y-full" : "translate-y-0"
        }`}
      >
        <div className="mx-auto flex h-[80px] max-w-[1400px] items-center justify-between px-6">
          {/* Logo */}
          <Link href="/" className="flex flex-col items-start min-w-[120px]">
            <span className="font-serif text-3xl font-bold leading-none tracking-tight text-ink">
              Mioralane
            </span>
            <span className="font-sans text-[10px] font-medium uppercase tracking-[0.3em] text-ink/60 mt-0.5">
              skincare
            </span>
          </Link>

          {/* Search Bar */}
          <div className="hidden md:flex flex-1 max-w-[500px] mx-8" ref={searchRef}>
            <form onSubmit={handleSearch} className="relative w-full">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-ink/40" />
              <input
                type="text"
                placeholder="Search entire store here..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => setSearchFocused(true)}
                className="w-full pl-12 pr-10 py-3 bg-ink/[0.04] border-none rounded-full text-sm text-ink placeholder:text-ink/40 outline-none focus:bg-ink/[0.06] transition-all"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-ink/40 hover:text-ink"
                >
                  <X className="h-4 w-4" />
                </button>
              )}

              {/* Live Suggestions */}
              {searchFocused && searchQuery.length >= 2 && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-surface rounded-2xl shadow-lg border border-border-light overflow-hidden z-50">
                  {searchResults.length > 0 ? (
                    <div className="p-2">
                      {searchResults.map((product) => (
                        <Link
                          key={product.id}
                          href={`/product/${product.slug}`}
                          onClick={() => {
                            setSearchQuery("");
                            setSearchFocused(false);
                          }}
                          className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-ink/[0.04] transition-colors no-underline"
                        >
                          <div className="w-10 h-10 rounded-lg bg-ink/[0.06] flex items-center justify-center text-xs font-bold text-ink/40">
                            {product.brand?.charAt(0)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-ink truncate">
                              {product.name}
                            </p>
                            <p className="text-xs text-ink/50">
                              {product.brand} · ৳{product.price.toLocaleString()}
                            </p>
                          </div>
                        </Link>
                      ))}
                      <button
                        type="submit"
                        className="w-full mt-1 px-4 py-2.5 text-sm font-medium text-accent hover:bg-ink/[0.04] rounded-xl transition-colors text-left"
                      >
                        Search for &ldquo;{searchQuery}&rdquo; →
                      </button>
                    </div>
                  ) : (
                    <div className="p-4 text-center text-sm text-ink/40">
                      No products found
                    </div>
                  )}
                </div>
              )}
            </form>
          </div>

          {/* Icons */}
          <div className="flex items-center gap-1">
            <Link
              href={isAuthenticated ? "/profile" : "/login"}
              className="p-2.5 text-ink/70 transition-colors hover:text-ink rounded-full hover:bg-ink/[0.04]"
              aria-label="Account"
            >
              <User className="h-5 w-5" />
            </Link>
            <button
              className="p-2.5 text-ink/70 transition-colors hover:text-ink rounded-full hover:bg-ink/[0.04]"
              aria-label="Wishlist"
            >
              <Heart className="h-5 w-5" />
            </button>
            <button
              onClick={toggleCart}
              className="relative p-2.5 text-ink/70 transition-colors hover:text-ink rounded-full hover:bg-ink/[0.04]"
              aria-label="Cart"
            >
              <ShoppingBag className="h-5 w-5" />
              {totalItems() > 0 && (
                <span className="absolute -top-0.5 -right-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-ink text-[10px] font-bold text-white">
                  {totalItems()}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Bottom Row - always sticky */}
      <div
        className={`fixed left-0 right-0 z-50 bg-white border-b border-border-light transition-all duration-300 ${
          scrolled ? "top-0" : "top-[80px]"
        }`}
      >
        <div className="mx-auto max-w-[1400px] px-6">
          <nav
            className={`flex items-center h-12 transition-all duration-300 ${
              scrolled ? "justify-between" : "justify-center gap-8"
            }`}
          >
            <div className="flex items-center gap-8">
              {scrolled && (
                <Link
                  href="/"
                  className="font-serif text-lg font-bold text-ink mr-4 no-underline"
                >
                  Mioralane
                </Link>
              )}
              {BOTTOM_NAV.map((link) => (
                <Link
                  key={link.href + link.label}
                  href={link.href}
                  className="text-sm font-black uppercase tracking-wider text-ink/80 hover:text-ink transition-colors no-underline"
                >
                  {link.label}
                </Link>
              ))}
            </div>

            {scrolled && (
              <div className="flex items-center gap-4">
                <Link
                  href={isAuthenticated ? "/profile" : "/login"}
                  className="text-sm font-medium text-ink/80 hover:text-ink transition-colors no-underline"
                >
                  Sign In
                </Link>
                <button className="text-ink/70 hover:text-ink transition-colors" aria-label="Search">
                  <Search className="h-5 w-5" />
                </button>
                <button className="text-ink/70 hover:text-ink transition-colors" aria-label="Wishlist">
                  <Heart className="h-5 w-5" />
                </button>
                <button
                  onClick={toggleCart}
                  className="relative text-ink/70 hover:text-ink transition-colors"
                  aria-label="Cart"
                >
                  <ShoppingBag className="h-5 w-5" />
                  {totalItems() > 0 && (
                    <span className="absolute -top-2 -right-2 flex h-5 w-5 items-center justify-center rounded-full bg-ink text-[10px] font-bold text-white">
                      {totalItems()}
                    </span>
                  )}
                </button>
              </div>
            )}
          </nav>
        </div>
      </div>
    </>
  );
}
