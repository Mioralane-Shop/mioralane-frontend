"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ShoppingBag, Search, User, Heart, X } from "lucide-react";
import { useCartStore } from "@/store/cart.store";
import { useAuthStore } from "@/store/auth.store";
import { useWishlistStore } from "@/store/wishlist.store";
import { MobileMenu } from "@/components/layout/mobile-menu";
import { UserMenu } from "@/components/layout/user-menu";
import { SearchModal } from "@/components/search/search-modal";
import { getComboMeta, getComboProducts } from "@/constants/combo";
import { BRANDS } from "@/constants/site";
import { productService } from "@/services/product.service";
import { formatPrice } from "@/lib/utils";
import type { Product } from "@/types/product";

const BOTTOM_NAV = [
  { label: "Skin Care", href: "/shop" },
  { label: "Collections", href: "/shop" },
  { label: "Combo", href: "/combo" },
  { label: "New", href: "/shop?sort=newest" },
  { label: "Brands", href: "/shop" },
  { label: "Support", href: "#" },
  { label: "Blog", href: "/blog" },
  { label: "Sales", href: "/shop?sort=offers" },
];

function BrandsNavItem() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  return (
    <div
      ref={ref}
      className="relative"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <Link
        href="/shop"
        className="text-sm font-black uppercase tracking-wider text-ink/80 hover:text-ink transition-colors no-underline"
      >
        Brands
      </Link>
      {open && (
        <div className="absolute left-1/2 top-full z-50 -translate-x-1/2 pt-2">
          <div className="w-[640px] rounded-2xl border border-border-light bg-white p-4 shadow-lg">
            <div className="grid grid-cols-3 gap-x-2 gap-y-0.5">
              {BRANDS.map((brand) => (
                <Link
                  key={brand}
                  href={`/shop?brand=${encodeURIComponent(brand)}`}
                  onClick={() => setOpen(false)}
                  className="truncate rounded-lg px-2 py-1.5 text-sm text-ink/70 transition-colors hover:bg-ink/[0.04] hover:text-accent"
                >
                  {brand}
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function ComboNavItem() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  const combos = getComboProducts();

  return (
    <div
      ref={ref}
      className="relative"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <Link
        href="/combo"
        className="text-sm font-black uppercase tracking-wider text-ink/80 hover:text-ink transition-colors no-underline"
      >
        Combo
      </Link>
      {open && (
        <div className="absolute left-1/2 top-full z-50 -translate-x-1/2 pt-2">
          <div className="w-[680px] rounded-2xl border border-border-light bg-white p-4 shadow-lg">
            <div className="flex items-center justify-between px-2 pb-3">
              <span className="text-[11px] font-bold uppercase tracking-[0.16em] text-accent-dark">
                Curated Bundles
              </span>
              <Link
                href="/combo"
                onClick={() => setOpen(false)}
                className="text-xs font-semibold text-accent transition-colors hover:text-accent-dark"
              >
                View all →
              </Link>
            </div>
            <div className="space-y-1.5">
              {combos.map((product) => {
                const meta = getComboMeta(product);
                return (
                  <Link
                    key={product.id}
                    href={`/product/${product.slug}`}
                    onClick={() => setOpen(false)}
                    className="flex items-center gap-3 rounded-xl px-2 py-2 transition-colors hover:bg-ink/[0.04] no-underline"
                  >
                    <div className="h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-ink/[0.06]">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={product.images?.[0]}
                        alt={product.name}
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-ink">
                        {product.name}
                      </p>
                      {meta?.includedItems && (
                        <p className="truncate text-xs text-ink-muted">
                          {meta.includedItems.join(" • ")}
                        </p>
                      )}
                    </div>
                    <div className="shrink-0 text-right">
                      <p className="text-sm font-bold text-ink">
                        {formatPrice(product.price)}
                      </p>
                      {meta?.savings ? (
                        <p className="text-[11px] font-medium text-success">
                          Save {formatPrice(meta.savings)}
                        </p>
                      ) : null}
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const MEGA_MENU_COLUMNS = [
  {
    id: "cleansers",
    label: "Cleansers",
    href: "/shop?category=cleansers",
    links: [
      { label: "Oil Cleansers", href: "/shop?category=oil-cleansers" },
      {
        label: "Water Based Cleansers",
        href: "/shop?category=water-cleansers",
      },
      { label: "Cleansing Balms", href: "/shop?category=cleansing-balms" },
      { label: "Make-Up Removers", href: "/shop?category=makeup-removers" },
      { label: "Micellar Waters", href: "/shop?category=micellar-waters" },
    ],
  },
  {
    id: "toners",
    label: "Toners",
    href: "/shop?category=toners",
    links: [
      { label: "Hydrating Toners", href: "/shop?category=hydrating-toners" },
      { label: "Calming Toners", href: "/shop?category=calming-toners" },
      { label: "Mist Toners", href: "/shop?category=mist-toners" },
      {
        label: "Exfoliating Toners",
        href: "/shop?category=exfoliating-toners",
      },
      { label: "Toner Pads", href: "/shop?category=toner-pads" },
    ],
  },
  {
    id: "treatments",
    label: "Treatments",
    href: "/shop?category=treatments",
    links: [
      { label: "Serums", href: "/shop?category=serums" },
      { label: "Ampoules", href: "/shop?category=ampoules" },
      { label: "Essences", href: "/shop?category=essences" },
      { label: "Spot Treatments", href: "/shop?category=spot-treatments" },
    ],
  },
  {
    id: "exfoliators",
    label: "Exfoliators",
    href: "/shop?category=exfoliators",
    links: [
      {
        label: "Physical Exfoliators",
        href: "/shop?category=physical-exfoliators",
      },
      {
        label: "Chemical Exfoliators",
        href: "/shop?category=chemical-exfoliators",
      },
    ],
  },
  {
    id: "concerns",
    label: "Skin Concerns",
    href: "/shop",
    links: [
      { label: "Acne", href: "/shop?concern=acne" },
      { label: "Anti-Aging", href: "/shop?concern=anti-aging" },
      { label: "Dry Skin", href: "/shop?concern=dry-skin" },
      { label: "Fungal Acne Safe", href: "/shop?concern=fungal-acne-safe" },
      { label: "Hyperpigmentation", href: "/shop?concern=hyperpigmentation" },
      { label: "Skin Redness", href: "/shop?concern=redness" },
      { label: "Sensitive Skin", href: "/shop?concern=sensitive" },
      { label: "Oily Skin", href: "/shop?concern=oily" },
    ],
  },
  {
    id: "moisturizers",
    label: "Moisturizers",
    href: "/shop?category=moisturizers",
    links: [
      { label: "Face Creams", href: "/shop?category=face-creams" },
      { label: "Gel Moisturizers", href: "/shop?category=gel-moisturizers" },
      { label: "Facial Oils", href: "/shop?category=facial-oils" },
      { label: "Emulsions", href: "/shop?category=emulsions" },
    ],
  },
  {
    id: "masks",
    label: "Masks",
    href: "/shop?category=masks",
    links: [
      { label: "Peeling Masks", href: "/shop?category=peeling-masks" },
      { label: "Sheet Masks", href: "/shop?category=sheet-masks" },
      { label: "Sleeping Masks", href: "/shop?category=sleeping-masks" },
      { label: "Wash-Off Masks", href: "/shop?category=wash-off-masks" },
    ],
  },
  {
    id: "lip-eye",
    label: "Lip & Eye Care",
    href: "/shop?category=lip-eye-care",
    links: [
      { label: "Eye Creams", href: "/shop?category=eye-creams" },
      { label: "Eye Patches", href: "/shop?category=eye-patches" },
      { label: "Lip Care", href: "/shop?category=lip-care" },
    ],
  },
  {
    id: "sunscreens",
    label: "Sunscreens",
    href: "/shop?category=sun-care",
    links: [
      { label: "SPF 50+", href: "/shop?category=spf50" },
      { label: "SPF 30", href: "/shop?category=spf30" },
      { label: "Sun Sticks", href: "/shop?category=sun-sticks" },
      { label: "After Sun Care", href: "/shop?category=after-sun" },
    ],
  },
  {
    id: "ingredients",
    label: "Shop By Ingredients",
    href: "/shop",
    links: [
      { label: "AHA BHA PHA", href: "/shop?ingredient=aha-bha-pha" },
      { label: "Centella", href: "/shop?ingredient=centella" },
      { label: "Hyaluronic Acid", href: "/shop?ingredient=hyaluronic-acid" },
      { label: "Peptides", href: "/shop?ingredient=peptides" },
      { label: "Propolis", href: "/shop?ingredient=propolis" },
      { label: "Snail Mucin", href: "/shop?ingredient=snail-mucin" },
      { label: "Vitamin C", href: "/shop?ingredient=vitamin-c" },
    ],
  },
];

function SkinCareNavItem({ scrolled }: { scrolled: boolean }) {
  const [open, setOpen] = useState(false);
  const [activeCol, setActiveCol] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const underlineRef = useRef<HTMLDivElement>(null);
  const headerRefs = useRef<Record<string, HTMLSpanElement | null>>({});
  const prevColRef = useRef<string | null>(null);
  const closeTimer = useRef<number | null>(null);

  const scheduleClose = () => {
    if (closeTimer.current) window.clearTimeout(closeTimer.current);
    closeTimer.current = window.setTimeout(() => setOpen(false), 180);
  };
  const cancelClose = () => {
    if (closeTimer.current) {
      window.clearTimeout(closeTimer.current);
      closeTimer.current = null;
    }
  };

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [open]);

  const positionUnderline = (id: string) => {
    const header = headerRefs.current[id];
    const panel = panelRef.current;
    const underline = underlineRef.current;
    if (!header || !panel || !underline) return;
    const hRect = header.getBoundingClientRect();
    const pRect = panel.getBoundingClientRect();
    const left = hRect.left - pRect.left;
    const top = hRect.bottom - pRect.top + 4;
    const width = hRect.width;
    if (prevColRef.current === null) {
      underline.style.transition = "none";
      underline.style.left = `${left}px`;
      underline.style.top = `${top}px`;
      underline.style.width = `${width}px`;
      void underline.offsetWidth;
      underline.style.transition = "";
    }
    prevColRef.current = id;
    underline.style.left = `${left}px`;
    underline.style.top = `${top}px`;
    underline.style.width = `${width}px`;
    setActiveCol(id);
  };

  const handleColumnEnter = (id: string) => {
    cancelClose();
    positionUnderline(id);
  };

  const handlePanelLeave = () => {
    setActiveCol(null);
    prevColRef.current = null;
    scheduleClose();
  };

  const panelTop = scrolled ? 56 : 172;

  return (
    <div
      ref={containerRef}
      className="relative"
      onMouseEnter={() => {
        setOpen(true);
        cancelClose();
      }}
      onMouseLeave={scheduleClose}
    >
      <Link
        href="/shop"
        className="text-sm font-black uppercase tracking-wider text-ink/80 hover:text-ink transition-colors no-underline"
      >
        Skin Care
      </Link>

      {open && (
        <div
          ref={panelRef}
          onMouseEnter={cancelClose}
          onMouseLeave={handlePanelLeave}
          className="fixed left-1/2 z-[60] w-full max-w-[1400px] -translate-x-1/2 rounded-2xl bg-[#FAF7F4] px-10 py-9 shadow-[0_24px_60px_-12px_rgba(0,0,0,0.18)]"
          style={{ top: panelTop }}
        >
          <div className="grid grid-cols-5 gap-x-10 gap-y-12">
            {MEGA_MENU_COLUMNS.map((col) => (
              <div
                key={col.id}
                onMouseEnter={() => handleColumnEnter(col.id)}
                className="min-w-0"
              >
                <div className="border-t border-[#C98A7D]/30 pt-4">
                  <Link
                    href={col.href}
                    onClick={() => setOpen(false)}
                    className="block"
                  >
                    <span
                      ref={(el) => {
                        headerRefs.current[col.id] = el;
                      }}
                      className="text-xs font-semibold uppercase tracking-[0.16em] text-[#1E1B18]"
                    >
                      {col.label}
                    </span>
                  </Link>
                </div>
                <ul className="mt-5 space-y-3.5">
                  {col.links.map((link) => (
                    <li key={link.label}>
                      <Link
                        href={link.href}
                        onClick={() => setOpen(false)}
                        className="text-sm text-[#1E1B18]/70 transition-colors hover:text-[#C98A7D]"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* Cursor-aware animated underline */}
          <div
            ref={underlineRef}
            className="pointer-events-none absolute h-[2px] bg-[#C98A7D] transition-all duration-200"
            style={{
              opacity: activeCol ? 1 : 0,
              transitionTimingFunction: "cubic-bezier(0.34, 1.56, 0.64, 1)",
            }}
          />
        </div>
      )}
    </div>
  );
}

export function Navbar() {
  const router = useRouter();
  const { toggleCart, totalItems } = useCartStore();
  const { isAuthenticated, _ready } = useAuthStore();
  const wishlistCount = useWishlistStore((s) => s.count());
  const [scrolled, setScrolled] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchFocused, setSearchFocused] = useState(false);
  const [searchModalOpen, setSearchModalOpen] = useState(false);
  const [searchResults, setSearchResults] = useState<Product[]>([]);
  const [searchingResults, setSearchingResults] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const query = searchQuery.trim();
    if (query) {
      router.push(`/shop?search=${encodeURIComponent(query)}`);
      setSearchQuery("");
      setSearchFocused(false);
    }
  };

  useEffect(() => {
    const query = searchQuery.trim();
    if (!searchFocused || query.length < 2) {
      setSearchResults([]);
      setSearchingResults(false);
      return;
    }

    let cancelled = false;
    setSearchingResults(true);

    const timer = window.setTimeout(async () => {
      try {
        const res = await productService.getAll({ search: query, limit: "5" });
        if (!cancelled) {
          setSearchResults(res.products ?? []);
        }
      } catch {
        if (!cancelled) {
          setSearchResults([]);
        }
      } finally {
        if (!cancelled) {
          setSearchingResults(false);
        }
      }
    }, 250);

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [searchFocused, searchQuery]);

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
      {/* Spacer to prevent content jump — header is fixed below the 36px announcement bar (116px mobile = 36+80, 165px desktop = 36+80+49) */}
      <div className="h-[100px] lg:h-[130px]" />

      {/* Top Row - slides up on scroll */}
      <div
        className={`fixed top-[36px] left-0 right-0 z-[60] bg-white transition-transform duration-300 ease-in-out ${scrolled ? "lg:-translate-y-full" : ""
          }`}
      >
        <div className="relative mx-auto flex h-[80px] max-w-[1400px] items-center justify-between px-6">
          {/* Left: hamburger + search (below lg) — raised above centered logo */}
          <div className="relative z-10 flex items-center gap-1 lg:hidden">
            <MobileMenu />
            <button
              onClick={() => setSearchModalOpen(true)}
              className="p-2.5 text-ink/70 transition-colors hover:text-ink rounded-full hover:bg-ink/[0.04]"
              aria-label="Search"
            >
              <Search className="h-5 w-5" />
            </button>
          </div>

          {/* Logo — centered on mobile/tablet, left-aligned on desktop */}
          <Link
            href="/"
            className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 lg:static lg:translate-x-0 lg:translate-y-0 flex flex-col items-center lg:items-start text-center lg:text-left"
          >
            <span className="font-serif text-xl sm:text-2xl md:text-3xl font-bold leading-none tracking-tight text-ink">
              Mioralane
            </span>
            <span className="font-sans text-[10px] font-medium uppercase tracking-[0.3em] text-ink/60 mt-0.5">
              skincare
            </span>
          </Link>

          {/* Search Bar */}
          <div
            className="hidden lg:flex flex-1 max-w-[500px] mx-8"
            ref={searchRef}
          >
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
              {searchFocused && searchQuery.trim().length >= 2 && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-surface rounded-2xl shadow-lg border border-border-light overflow-hidden z-[80]">
                  {searchingResults ? (
                    <div className="p-4 text-center text-sm text-ink/40">
                      Searching...
                    </div>
                  ) : searchResults.length > 0 ? (
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
                              {product.brand} · ৳
                              {product.price.toLocaleString()}
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
                      No products found for &ldquo;{searchQuery.trim()}&rdquo;
                    </div>
                  )}
                </div>
              )}
            </form>
          </div>

          {/* Icons — raised above centered logo */}
          <div className="relative z-10 flex items-center gap-1">
            {_ready && isAuthenticated ? (
              <UserMenu />
            ) : (
              <Link
                href="/login"
                className="p-2.5 text-ink/70 transition-colors hover:text-ink rounded-full hover:bg-ink/[0.04]"
                aria-label="Sign in"
              >
                <User className="h-5 w-5" />
              </Link>
            )}
            {/* Wishlist — desktop only (matches mobile reference) */}
            <Link
              href="/wishlist"
              className="relative inline-flex p-2.5 text-ink/70 transition-colors hover:text-ink rounded-full hover:bg-ink/[0.04]"
              aria-label="Wishlist"
            >
              <Heart className="h-5 w-5" />
              {wishlistCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-white">
                  {wishlistCount}
                </span>
              )}
            </Link>
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

      {/* Full-screen search modal */}
      <SearchModal
        open={searchModalOpen}
        onClose={() => setSearchModalOpen(false)}
      />

      {/* Bottom Row - desktop only (tablet & mobile use the hamburger menu instead) */}
      <div
        className={`hidden lg:block fixed left-0 right-0 z-50 bg-white border-b border-border-light transition-all duration-300 ${scrolled ? "top-0" : "top-[116px]"
          }`}
      >
        <div className="mx-auto max-w-[1400px] px-6">
          <nav
            className={`flex items-center h-12 transition-all duration-300 ${scrolled ? "justify-between" : "justify-center gap-8"
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
              {BOTTOM_NAV.map((link) => {
                if (link.label === "Skin Care") {
                  return (
                    <SkinCareNavItem
                      key={link.href + link.label}
                      scrolled={scrolled}
                    />
                  );
                }
                if (link.label === "Brands") {
                  return <BrandsNavItem key={link.href + link.label} />;
                }
                if (link.label === "Combo") {
                  return <ComboNavItem key={link.href + link.label} />;
                }
                return (
                  <Link
                    key={link.href + link.label}
                    href={link.href}
                    className="text-sm font-black uppercase tracking-wider text-ink/80 hover:text-ink transition-colors no-underline"
                  >
                    {link.label}
                  </Link>
                );
              })}
            </div>

            {scrolled && (
              <div className="flex items-center gap-4">
                {_ready && isAuthenticated ? (
                  <UserMenu />
                ) : (
                  <Link
                    href="/login"
                    className="text-sm font-medium text-ink/80 hover:text-ink transition-colors no-underline"
                  >
                    Sign In
                  </Link>
                )}
                <button
                  onClick={() => setSearchModalOpen(true)}
                  className="text-ink/70 hover:text-ink transition-colors"
                  aria-label="Search"
                >
                  <Search className="h-5 w-5" />
                </button>
                <Link
                  href="/wishlist"
                  className="relative inline-flex text-ink/70 hover:text-ink transition-colors"
                  aria-label="Wishlist"
                >
                  <Heart className="h-5 w-5" />
                  {wishlistCount > 0 && (
                    <span className="absolute -top-2 -right-2 flex h-5 w-5 items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-white">
                      {wishlistCount}
                    </span>
                  )}
                </Link>
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
