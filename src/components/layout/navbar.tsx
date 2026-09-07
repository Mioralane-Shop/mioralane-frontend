"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Heart, Search, ShoppingBag, User, X } from "lucide-react";
import { MobileMenu } from "@/components/layout/mobile-menu";
import { BrandLogo } from "@/components/layout/brand-logo";
import { NavigationItem } from "@/components/layout/navigation-item";
import { UserMenu } from "@/components/layout/user-menu";
import { ProductImage } from "@/components/common/product-image";
import { SearchModal } from "@/components/search/search-modal";
import { BRANDS } from "@/constants/site";
import { useAuthStore } from "@/store/auth.store";
import { useCartStore } from "@/store/cart.store";
import { useWishlistStore } from "@/store/wishlist.store";
import { useCombos } from "@/hooks/use-combos";
import { useProductSearch } from "@/hooks/use-product-search";
import { formatPrice } from "@/lib/utils";

const BOTTOM_NAV = [
  { label: "Skin Care", href: "/shop" },
  { label: "Collections", href: "/shop" },
  { label: "Combo", href: "/combo" },
  { label: "New", href: "/shop?sort=newest" },
  { label: "Brands", href: "/shop" },
  { label: "Support", comingSoon: true },
  { label: "Blog", href: "/blog" },
  { label: "Sales", comingSoon: true },
];

const COMPACT_NAV_HYSTERESIS = 12;
const COMPACT_NAV_TRANSITION =
  "duration-[320ms] ease-[cubic-bezier(0.22,1,0.36,1)]";
const COMPACT_NAV_FADE = "duration-[150ms] ease-out";

function BrandsNavItem() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
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
        className="text-sm font-black uppercase tracking-wider text-ink/80 transition-colors no-underline hover:text-ink"
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
  const { data: combos = [] } = useCombos();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
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
        href="/combo"
        className="text-sm font-black uppercase tracking-wider text-ink/80 transition-colors no-underline hover:text-ink"
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
                View all -&gt;
              </Link>
            </div>
            <div className="space-y-1.5">
              {combos.map((product) => (
                <Link
                  key={product.id}
                  href={`/combo/${product.slug}`}
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-3 rounded-xl px-2 py-2 transition-colors no-underline hover:bg-ink/[0.04]"
                >
                  <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-ink/[0.06]">
                    <ProductImage
                      src={product.images?.[0] ?? ""}
                      alt={product.name}
                      fill
                      sizes="48px"
                      className="object-cover"
                      fallbackId={product.id}
                      deliveryPreset="thumbnail"
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-ink">
                      {product.name}
                    </p>
                    {product.includedItems?.length ? (
                      <p className="truncate text-xs text-ink-muted">
                        {product.includedItems.join(" | ")}
                      </p>
                    ) : null}
                  </div>
                  <div className="shrink-0 text-right">
                    <p className="text-sm font-bold text-ink">
                      {formatPrice(product.price)}
                    </p>
                    {product.savings ? (
                      <p className="text-[11px] font-medium text-success">
                        Save {formatPrice(product.savings)}
                      </p>
                    ) : null}
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

type MegaMenuLink = {
  label: string;
  href?: string;
  comingSoon?: boolean;
};

type MegaMenuColumn = {
  id: string;
  label: string;
  href?: string;
  comingSoon?: boolean;
  links: MegaMenuLink[];
};

const MEGA_MENU_COLUMNS: MegaMenuColumn[] = [
  {
    id: "cleansers",
    label: "Cleansers",
    href: "/shop?category=cleansers",
    links: [
      { label: "Oil Cleansers", comingSoon: true },
      { label: "Water Based Cleansers", comingSoon: true },
      { label: "Cleansing Balms", comingSoon: true },
      { label: "Make-Up Removers", comingSoon: true },
      { label: "Micellar Waters", comingSoon: true },
    ],
  },
  {
    id: "toners",
    label: "Toners",
    href: "/shop?category=toners",
    links: [
      { label: "Hydrating Toners", comingSoon: true },
      { label: "Calming Toners", comingSoon: true },
      { label: "Mist Toners", comingSoon: true },
      { label: "Exfoliating Toners", comingSoon: true },
      { label: "Toner Pads", comingSoon: true },
    ],
  },
  {
    id: "treatments",
    label: "Treatments",
    comingSoon: true,
    links: [
      { label: "Serums", comingSoon: true },
      { label: "Ampoules", comingSoon: true },
      { label: "Essences", comingSoon: true },
      { label: "Spot Treatments", comingSoon: true },
    ],
  },
  {
    id: "exfoliators",
    label: "Exfoliators",
    comingSoon: true,
    links: [
      { label: "Physical Exfoliators", comingSoon: true },
      { label: "Chemical Exfoliators", comingSoon: true },
    ],
  },
  {
    id: "concerns",
    label: "Skin Concerns",
    href: "/shop",
    links: [
      { label: "Acne", href: "/shop?concern=acne" },
      { label: "Anti-Aging", href: "/shop?concern=anti-aging" },
      { label: "Dry Skin", comingSoon: true },
      { label: "Fungal Acne Safe", comingSoon: true },
      { label: "Hyperpigmentation", comingSoon: true },
      { label: "Skin Redness", comingSoon: true },
      { label: "Sensitive Skin", href: "/shop?concern=sensitive" },
      { label: "Oily Skin", comingSoon: true },
    ],
  },
  {
    id: "moisturizers",
    label: "Moisturizers",
    href: "/shop?category=moisturizers",
    links: [
      { label: "Face Creams", comingSoon: true },
      { label: "Gel Moisturizers", comingSoon: true },
      { label: "Facial Oils", comingSoon: true },
      { label: "Emulsions", comingSoon: true },
    ],
  },
  {
    id: "masks",
    label: "Masks",
    href: "/shop?category=masks",
    links: [
      { label: "Peeling Masks", comingSoon: true },
      { label: "Sheet Masks", comingSoon: true },
      { label: "Sleeping Masks", comingSoon: true },
      { label: "Wash-Off Masks", comingSoon: true },
    ],
  },
  {
    id: "lip-eye",
    label: "Lip & Eye Care",
    comingSoon: true,
    links: [
      { label: "Eye Creams", comingSoon: true },
      { label: "Eye Patches", comingSoon: true },
      { label: "Lip Care", comingSoon: true },
    ],
  },
  {
    id: "sunscreens",
    label: "Sunscreens",
    href: "/shop?category=sun-care",
    links: [
      { label: "SPF 50+", comingSoon: true },
      { label: "SPF 30", comingSoon: true },
      { label: "Sun Sticks", comingSoon: true },
      { label: "After Sun Care", comingSoon: true },
    ],
  },
  {
    id: "ingredients",
    label: "Shop By Ingredients",
    comingSoon: true,
    links: [
      { label: "AHA BHA PHA", comingSoon: true },
      { label: "Centella", comingSoon: true },
      { label: "Hyaluronic Acid", comingSoon: true },
      { label: "Peptides", comingSoon: true },
      { label: "Propolis", comingSoon: true },
      { label: "Snail Mucin", comingSoon: true },
      { label: "Vitamin C", comingSoon: true },
    ],
  },
];

function SkinCareNavItem({ panelTop }: { panelTop: number }) {
  const [open, setOpen] = useState(false);
  const [activeCol, setActiveCol] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const underlineRef = useRef<HTMLDivElement>(null);
  const headerRefs = useRef<Record<string, HTMLSpanElement | null>>({});
  const prevColRef = useRef<string | null>(null);
  const closeTimer = useRef<number | null>(null);

  const scheduleClose = () => {
    if (closeTimer.current) {
      window.clearTimeout(closeTimer.current);
    }
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

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
      }
    };

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open]);

  useEffect(() => {
    if (!open) return;

    const onMouseDown = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", onMouseDown);
    return () => document.removeEventListener("mousedown", onMouseDown);
  }, [open]);

  const positionUnderline = (id: string) => {
    const header = headerRefs.current[id];
    const panel = panelRef.current;
    const underline = underlineRef.current;

    if (!header || !panel || !underline) return;

    const headerRect = header.getBoundingClientRect();
    const panelRect = panel.getBoundingClientRect();
    const left = headerRect.left - panelRect.left;
    const top = headerRect.bottom - panelRect.top + 4;
    const width = headerRect.width;

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

  const handlePanelLeave = () => {
    setActiveCol(null);
    prevColRef.current = null;
    scheduleClose();
  };

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
        className="text-sm font-black uppercase tracking-wider text-ink/80 transition-colors no-underline hover:text-ink"
      >
        Skin Care
      </Link>

      {open && (
        <div
          ref={panelRef}
          onMouseEnter={cancelClose}
          onMouseLeave={handlePanelLeave}
          className="fixed left-1/2 z-[90] w-full max-w-[1400px] -translate-x-1/2 rounded-2xl bg-[#FAF7F4] px-10 py-9 shadow-[0_24px_60px_-12px_rgba(0,0,0,0.18)]"
          style={{ top: panelTop }}
        >
          <div className="grid grid-cols-5 gap-x-10 gap-y-12">
            {MEGA_MENU_COLUMNS.map((column) => (
              <div
                key={column.id}
                onMouseEnter={() => positionUnderline(column.id)}
                className="min-w-0"
              >
                <div className="border-t border-[#C98A7D]/30 pt-4">
                  <NavigationItem
                    label={column.label}
                    href={column.href}
                    comingSoon={column.comingSoon}
                    onClick={() => setOpen(false)}
                    className="block"
                  >
                    <span
                      ref={(element) => {
                        headerRefs.current[column.id] = element;
                      }}
                      className="text-xs font-semibold uppercase tracking-[0.16em] text-[#1E1B18]"
                    >
                      {column.label}
                    </span>
                  </NavigationItem>
                </div>
                <ul className="mt-5 space-y-3.5">
                  {column.links.map((link) => (
                    <li key={link.label}>
                      <NavigationItem
                        label={link.label}
                        href={link.href}
                        comingSoon={link.comingSoon}
                        onClick={() => setOpen(false)}
                        className="text-sm text-[#1E1B18]/70 transition-colors hover:text-[#C98A7D]"
                      />
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

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

function DesktopNavLinks({ panelTop }: { panelTop: number }) {
  return (
    <>
      {BOTTOM_NAV.map((link) => {
        if (link.label === "Skin Care") {
          return (
            <SkinCareNavItem
              key={link.href + link.label}
              panelTop={panelTop}
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
          <NavigationItem
            key={link.label}
            label={link.label}
            href={link.href}
            comingSoon={link.comingSoon}
            className="text-sm font-black uppercase tracking-wider text-ink/80 transition-colors no-underline hover:text-ink"
          />
        );
      })}
    </>
  );
}

function HeaderIcons({
  compact = false,
  showSearchButton = false,
  onSearchClick,
}: {
  compact?: boolean;
  showSearchButton?: boolean;
  onSearchClick?: () => void;
}) {
  const { toggleCart, totalItems } = useCartStore();
  const { isAuthenticated, _ready } = useAuthStore();
  const wishlistCount = useWishlistStore((state) => state.count());
  const iconClassName = compact
    ? "rounded-full p-2 text-ink/70 transition-colors hover:bg-ink/[0.04] hover:text-ink"
    : "rounded-full p-2.5 text-ink/70 transition-colors hover:bg-ink/[0.04] hover:text-ink";
  const badgeClassName = compact
    ? "absolute -right-1 -top-1 flex h-[18px] w-[18px] items-center justify-center rounded-full text-[9px] font-bold text-white"
    : "absolute -right-0.5 -top-0.5 flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold text-white";
  const iconSize = compact ? "h-[18px] w-[18px]" : "h-5 w-5";

  return (
    <div className={`relative z-10 flex items-center ${compact ? "gap-0.5" : "gap-1"}`}>
      {showSearchButton ? (
        <button
          onClick={onSearchClick}
          className={iconClassName}
          aria-label="Search"
        >
          <Search className={iconSize} />
        </button>
      ) : null}

      {_ready && isAuthenticated ? (
        <UserMenu />
      ) : (
        <Link href="/login" className={iconClassName} aria-label="Sign in">
          <User className={iconSize} />
        </Link>
      )}

      <Link href="/wishlist" className={`relative inline-flex ${iconClassName}`} aria-label="Wishlist">
        <Heart className={iconSize} />
        {wishlistCount > 0 ? (
          <span className={`${badgeClassName} bg-rose-500`}>{wishlistCount}</span>
        ) : null}
      </Link>

      <button onClick={toggleCart} className={`relative ${iconClassName}`} aria-label="Cart">
        <ShoppingBag className={iconSize} />
        {totalItems() > 0 ? (
          <span className={`${badgeClassName} bg-ink`}>{totalItems()}</span>
        ) : null}
      </button>
    </div>
  );
}

export function Navbar() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [searchFocused, setSearchFocused] = useState(false);
  const [searchModalOpen, setSearchModalOpen] = useState(false);
  const [showCompactDesktopNav, setShowCompactDesktopNav] = useState(false);
  const [defaultDesktopNavBottom, setDefaultDesktopNavBottom] = useState(164);
  const [compactDesktopNavBottom, setCompactDesktopNavBottom] = useState(64);
  const compactActiveRef = useRef(false);
  const desktopHeaderRef = useRef<HTMLElement>(null);
  const desktopMainHeaderRef = useRef<HTMLDivElement>(null);
  const desktopDefaultNavRef = useRef<HTMLDivElement>(null);
  const desktopCompactNavRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLDivElement>(null);
  const {
    data: searchResults = [],
    isLoading: searchingResults,
    isError: searchError,
    isSettling: searchSettling,
    refetch: refetchSearch,
  } = useProductSearch(searchQuery, { enabled: searchFocused, limit: 5 });

  const handleSearch = (event: React.FormEvent) => {
    event.preventDefault();
    const query = searchQuery.trim();

    if (!query) return;

    router.push(`/shop?search=${encodeURIComponent(query)}`);
    setSearchQuery("");
    setSearchFocused(false);
  };

  useEffect(() => {
    const updateMeasurements = () => {
      const isDesktop =
        window.matchMedia("(min-width: 1024px)").matches;

      if (desktopMainHeaderRef.current && isDesktop) {
        const mainHeaderBottom =
          desktopMainHeaderRef.current.getBoundingClientRect().bottom +
          window.scrollY;
        const shouldActivate =
          !compactActiveRef.current &&
          window.scrollY >= mainHeaderBottom + COMPACT_NAV_HYSTERESIS;
        const shouldDeactivate =
          compactActiveRef.current &&
          window.scrollY <= mainHeaderBottom - COMPACT_NAV_HYSTERESIS;
        if (shouldActivate || shouldDeactivate) {
          compactActiveRef.current = shouldActivate;
          setShowCompactDesktopNav(shouldActivate);
        }
      } else {
        const shouldActivate =
          !compactActiveRef.current &&
          window.scrollY >= COMPACT_NAV_HYSTERESIS;
        const shouldDeactivate =
          compactActiveRef.current &&
          window.scrollY <= COMPACT_NAV_HYSTERESIS;

        if (shouldActivate || shouldDeactivate) {
          compactActiveRef.current = shouldActivate;
          setShowCompactDesktopNav(shouldActivate);
        }
      }

      if (desktopDefaultNavRef.current) {
        setDefaultDesktopNavBottom(
          desktopDefaultNavRef.current.getBoundingClientRect().bottom,
        );
      }

      if (desktopCompactNavRef.current) {
        setCompactDesktopNavBottom(
          desktopCompactNavRef.current.getBoundingClientRect().bottom,
        );
      }
    };

    const scheduleMeasurements = () => {
      requestAnimationFrame(updateMeasurements);
    };

    updateMeasurements();
    window.addEventListener("scroll", scheduleMeasurements, { passive: true });
    window.addEventListener("resize", scheduleMeasurements);

    const observer =
      typeof ResizeObserver !== "undefined"
        ? new ResizeObserver(updateMeasurements)
        : null;

    if (desktopHeaderRef.current && observer) {
      observer.observe(desktopHeaderRef.current);
    }

    if (desktopCompactNavRef.current && observer) {
      observer.observe(desktopCompactNavRef.current);
    }

    return () => {
      window.removeEventListener("scroll", scheduleMeasurements);
      window.removeEventListener("resize", scheduleMeasurements);
      observer?.disconnect();
    };
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setSearchFocused(false);
      }
    };

    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  return (
    <>
      <header className="sticky top-0 z-[70] bg-white lg:hidden">
        <div className="border-b border-border-light">
          <div className="relative mx-auto flex h-[80px] max-w-[1400px] items-center justify-between px-6">
            <div className="relative z-10 flex items-center gap-1">
              <MobileMenu />
              <button
                onClick={() => setSearchModalOpen(true)}
                className="rounded-full p-2.5 text-ink/70 transition-colors hover:bg-ink/[0.04] hover:text-ink"
                aria-label="Search"
              >
                <Search className="h-5 w-5" />
              </button>
            </div>

            <BrandLogo
              size="md"
              variant={showCompactDesktopNav ? "icon" : "full"}
              className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
              priority
            />

            <HeaderIcons />
          </div>
        </div>
      </header>

      <header
        ref={desktopHeaderRef}
        className="hidden bg-white lg:block"
      >
        <div
          ref={desktopMainHeaderRef}
          className="border-b border-border-light"
        >
          <div className="mx-auto flex h-[80px] max-w-[1400px] items-center justify-between px-6">
            <BrandLogo
              size="lg"
              variant="full"
              className="flex-shrink-0"
              priority
            />

            <div ref={searchRef} className="mx-8 flex max-w-[500px] flex-1">
              <form onSubmit={handleSearch} className="relative w-full">
                <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-ink/40" />
                <input
                  type="text"
                  placeholder="Search entire store here..."
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                  onFocus={() => setSearchFocused(true)}
                  className="w-full rounded-full border-none bg-ink/[0.04] py-3 pl-12 pr-10 text-sm text-ink outline-none transition-all placeholder:text-ink/40 focus:bg-ink/[0.06]"
                />
                {searchQuery ? (
                  <button
                    type="button"
                    onClick={() => setSearchQuery("")}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-ink/40 hover:text-ink"
                  >
                    <X className="h-4 w-4" />
                  </button>
                ) : null}

                {searchFocused && searchQuery.trim().length >= 2 ? (
                  <div className="absolute left-0 right-0 top-full z-[80] mt-2 overflow-hidden rounded-2xl border border-border-light bg-surface shadow-lg">
                    {searchingResults || searchSettling ? (
                      <div className="p-4 text-center text-sm text-ink/40">
                        Searching...
                      </div>
                    ) : searchError ? (
                      <div className="p-4 text-center">
                        <p className="text-sm font-medium text-ink">
                          Couldn&apos;t load search results.
                        </p>
                        <p className="mt-1 text-xs text-ink/50">
                          Please try again in a moment.
                        </p>
                        <button
                          type="button"
                          onClick={() => refetchSearch()}
                          className="mt-3 rounded-full bg-accent px-4 py-2 text-xs font-medium text-white transition-colors hover:bg-accent-dark"
                        >
                          Retry
                        </button>
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
                            className="flex items-center gap-3 rounded-xl px-4 py-3 transition-colors no-underline hover:bg-ink/[0.04]"
                          >
                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-ink/[0.06] text-xs font-bold text-ink/40">
                              {product.brand?.charAt(0)}
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="truncate text-sm font-medium text-ink">
                                {product.name}
                              </p>
                              <p className="text-xs text-ink/50">
                                {product.brand} - {formatPrice(product.price)}
                              </p>
                            </div>
                          </Link>
                        ))}
                        <button
                          type="submit"
                          className="mt-1 w-full rounded-xl px-4 py-2.5 text-left text-sm font-medium text-accent transition-colors hover:bg-ink/[0.04]"
                        >
                          Search for &ldquo;{searchQuery}&rdquo; -&gt;
                        </button>
                      </div>
                    ) : (
                      <div className="p-4 text-center text-sm text-ink/40">
                        No products found for &ldquo;{searchQuery.trim()}&rdquo;
                      </div>
                    )}
                  </div>
                ) : null}
              </form>
            </div>

            <HeaderIcons />
          </div>
        </div>

        <div
          ref={desktopDefaultNavRef}
          className={`border-b border-border-light bg-white transition-[opacity,transform] ${COMPACT_NAV_TRANSITION} ${
            showCompactDesktopNav
              ? "pointer-events-none -translate-y-1 opacity-0"
              : "translate-y-0 opacity-100"
          }`}
        >
          <div className="mx-auto max-w-[1400px] px-6">
            <nav className="flex h-12 items-center justify-center gap-8">
              <DesktopNavLinks panelTop={defaultDesktopNavBottom} />
            </nav>
          </div>
        </div>
      </header>

      <div
        ref={desktopCompactNavRef}
        className={`fixed left-0 right-0 top-0 z-[80] hidden border-b border-border-light/90 bg-white transition-[opacity,transform] ${COMPACT_NAV_TRANSITION} lg:block ${
          showCompactDesktopNav
            ? "translate-y-0 opacity-100"
            : "pointer-events-none -translate-y-3 opacity-0"
        }`}
      >
        <div className="mx-auto grid h-[60px] max-w-[1400px] grid-cols-[auto_1fr_auto] items-center gap-8 px-6">
          <BrandLogo
            size="md"
            variant="icon"
            className={`transition-opacity ${COMPACT_NAV_FADE} ${
              showCompactDesktopNav ? "opacity-100" : "opacity-0"
            }`}
            priority
          />

          <nav className="flex items-center justify-center gap-8">
            <DesktopNavLinks panelTop={compactDesktopNavBottom} />
          </nav>

          <div
            className={`transition-opacity ${COMPACT_NAV_FADE} ${
              showCompactDesktopNav ? "opacity-100" : "opacity-0"
            }`}
          >
            <HeaderIcons
              compact
              showSearchButton
              onSearchClick={() => setSearchModalOpen(true)}
            />
          </div>
        </div>
      </div>

      <SearchModal
        open={searchModalOpen}
        onClose={() => setSearchModalOpen(false)}
      />
    </>
  );
}
