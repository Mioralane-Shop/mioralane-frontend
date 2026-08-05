"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { ShoppingBag, Search } from "lucide-react";
import { useCartStore } from "@/store/cart.store";
import { SITE_NAME, NAV_LINKS, BRANDS } from "@/constants/site";
import { MobileMenu } from "./mobile-menu";

export function Navbar() {
  const { toggleCart, totalItems } = useCartStore();
  const [scrolled, setScrolled] = useState(false);
  const [brandsOpen, setBrandsOpen] = useState(false);
  const [brandSearch, setBrandSearch] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);

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
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setBrandsOpen(false);
      }
    };
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  const filteredBrands = BRANDS.filter((b) =>
    b.toLowerCase().includes(brandSearch.toLowerCase()),
  );

  return (
    <nav
      className={`sticky top-0 z-40 w-full transition-all duration-300 ${
        scrolled
          ? "bg-white/94 backdrop-blur-xl border-b border-border-light"
          : "bg-white/95 backdrop-blur-lg border-b border-border-light"
      }`}
      style={{ height: "72px" }}
    >
      <div className="mx-auto flex h-full max-w-[1200px] items-center justify-between px-6">
        {/* Left: Mobile menu + Logo */}
        <div className="flex items-center gap-4">
          <MobileMenu />
          <Link href="/" className="relative h-[28px] w-[140px] block">
            {/* Full logo */}
            <span
              className={`font-serif italic absolute top-0 left-0 whitespace-nowrap transition-all duration-300 ${
                scrolled
                  ? "opacity-0 translate-x-1 pointer-events-none"
                  : "opacity-100 translate-x-0"
              }`}
              style={{ fontSize: "24px", fontWeight: 500 }}
            >
              {SITE_NAME.slice(0, 3)}
              <span className="text-accent font-normal">
                {SITE_NAME.slice(3)}
              </span>
            </span>
            {/* Compact mark */}
            <span
              className={`absolute top-0 left-0 transition-all duration-400 ${
                scrolled
                  ? "opacity-100 scale-100"
                  : "opacity-0 scale-75 pointer-events-none"
              }`}
            >
              <Image
                src="/logo-m.svg"
                alt="M"
                width={34}
                height={34}
                className="object-contain"
              />
            </span>
          </Link>
        </div>

        {/* Center: Nav links */}
        <div className="hidden md:flex items-center gap-8">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="relative text-sm font-medium text-ink-soft transition-colors hover:text-ink py-1 after:absolute after:bottom-[-2px] after:left-0 after:h-[1.5px] after:w-0 after:bg-accent after:transition-all after:duration-300 hover:after:w-full"
            >
              {link.label}
            </Link>
          ))}

          {/* Brands dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setBrandsOpen(!brandsOpen)}
              className="relative text-sm font-medium text-ink-soft transition-colors hover:text-ink py-1 flex items-center gap-1 after:absolute after:bottom-[-2px] after:left-0 after:h-[1.5px] after:w-0 after:bg-accent after:transition-all after:duration-300 hover:after:w-full"
            >
              Brands
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                className={`w-3 h-3 transition-transform ${brandsOpen ? "rotate-180" : ""}`}
              >
                <path d="m6 9 6 6 6-6" />
              </svg>
            </button>

            {brandsOpen && (
              <div className="absolute top-full left-1/2 -translate-x-1/2 w-[min(520px,90vw)] max-h-[70vh] overflow-y-auto bg-surface rounded-b-2xl shadow-lg border border-border-light border-t-0 p-6 z-50">
                <h3 className="font-serif text-lg mb-1">Shop by Brand</h3>
                <p className="text-sm text-ink-soft font-light mb-4">
                  Explore your favorite Korean skincare brands
                </p>
                <input
                  type="text"
                  placeholder="Search brands..."
                  value={brandSearch}
                  onChange={(e) => setBrandSearch(e.target.value)}
                  className="w-full px-4 py-3 border border-border rounded-xl text-sm outline-none mb-4 focus:border-accent transition-colors"
                />
                <div className="grid grid-cols-4 gap-2 max-h-[280px] overflow-y-auto">
                  {filteredBrands.map((brand) => (
                    <Link
                      key={brand}
                      href={`/shop?brand=${encodeURIComponent(brand)}`}
                      onClick={() => {
                        setBrandsOpen(false);
                        setBrandSearch("");
                      }}
                      className="px-3 py-2.5 rounded-xl border border-border-light bg-surface text-xs font-medium text-ink-soft text-center cursor-pointer transition-all hover:border-accent hover:text-accent hover:bg-accent-pale no-underline"
                    >
                      {brand}
                    </Link>
                  ))}
                </div>
                <div className="mt-4 pt-4 border-t border-border-light">
                  <Link
                    href="/shop"
                    onClick={() => {
                      setBrandsOpen(false);
                      setBrandSearch("");
                    }}
                    className="text-sm font-semibold text-accent"
                  >
                    View All Brands →
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-4">
          <Link
            href="/shop"
            className="p-1.5 text-ink transition-colors hover:text-accent"
            aria-label="Search"
          >
            <Search className="h-5 w-5" />
          </Link>

          <button
            onClick={toggleCart}
            className="relative p-1.5 text-ink transition-colors hover:text-accent"
            aria-label="Cart"
          >
            <ShoppingBag className="h-5 w-5" />
            {totalItems() > 0 && (
              <span className="absolute -top-1 -right-1 flex h-[18px] w-[18px] items-center justify-center rounded-full bg-accent text-[10px] font-bold text-white">
                {totalItems()}
              </span>
            )}
          </button>
        </div>
      </div>
    </nav>
  );
}
