"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowRight, Heart, Search, ShoppingBag, User, X } from "lucide-react";
import { MobileMenu } from "@/components/layout/mobile-menu";
import { BrandLogo } from "@/components/layout/brand-logo";
import { NavigationItem } from "@/components/layout/navigation-item";
import { UserMenu } from "@/components/layout/user-menu";
import { ProductImage } from "@/components/common/product-image";
import { SearchModal } from "@/components/search/search-modal";
import { Skeleton } from "@/components/ui/skeleton";
import { BRANDS } from "@/constants/site";
import { PRIMARY_NAV, type MegaMenuColumn } from "@/constants/navigation";
import { useBrands } from "@/hooks/use-brands";
import { isActiveNavPath, navLinkClass } from "@/lib/nav-active";
import { productShortName } from "@/lib/product-name";
import { firstRenderableImageSrc } from "@/lib/safe-image-src";
import { useAuthStore } from "@/store/auth.store";
import { useCartStore } from "@/store/cart.store";
import { useWishlistStore } from "@/store/wishlist.store";
import { useCombos } from "@/hooks/use-combos";
import { useMegaMenu } from "@/hooks/use-mega-menu";
import { useProductSearch } from "@/hooks/use-product-search";
import { MEGA_MENU_VIEW_ALL_HREF, megaMenuTargetHref } from "@/lib/mega-menu";
import type { MegaMenuItem, MegaMenuTab } from "@/types/mega-menu";
import { formatPrice } from "@/lib/utils";

const COMPACT_NAV_HYSTERESIS = 12;
const COMPACT_NAV_TRANSITION =
  "duration-[320ms] ease-[cubic-bezier(0.22,1,0.36,1)]";
const COMPACT_NAV_FADE = "duration-[150ms] ease-out";

/** What the brand dropdown renders, from the API or the bundled fallback. */
type NavBrand = { name: string };

function BrandsNavItem() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const { brands } = useBrands();
  const pathname = usePathname();
  const isActive = isActiveNavPath(pathname, "/brands");

  // Admin-curated brands, or the bundled list while the request is in flight, if
  // it fails, or before anything has been curated. The fallback is what keeps the
  // dropdown usable on a cold API; it is removed in the cleanup slice, once the
  // API is the only source.
  const entries: NavBrand[] =
    brands.length > 0
      ? brands.map((brand) => ({ name: brand.name }))
      : BRANDS.map((name) => ({ name }));

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
        href="/brands"
        aria-current={isActive ? "page" : undefined}
        className={navLinkClass(isActive)}
      >
        Brands
      </Link>
      {open && (
        <div className="absolute left-1/2 top-full z-50 -translate-x-1/2 pt-2">
          <div className="w-[min(640px,calc(100vw-2rem))] rounded-2xl border border-border-light bg-white p-4 shadow-lg">
            <div className="grid grid-cols-3 gap-x-2 gap-y-0.5">
              {entries.map((brand) => (
                // Names only. A logo here was inline with the name at a fixed CSS
                // height, and because the marks have wildly different aspect ratios
                // and widths it left the three columns ragged — rows shifted
                // depending on which brands happened to have artwork. The name
                // alone keeps every row on the same baseline.
                <Link
                  key={brand.name}
                  href={`/shop?brand=${encodeURIComponent(brand.name)}`}
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-2 rounded-lg px-2 py-1.5 text-sm text-ink/70 transition-colors hover:bg-ink/[0.04] hover:text-accent"
                >
                  <span className="truncate">{brand.name}</span>
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
  const pathname = usePathname();
  const isActive = isActiveNavPath(pathname, "/combo");

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
        aria-current={isActive ? "page" : undefined}
        className={navLinkClass(isActive)}
      >
        Combo
      </Link>
      {open && (
        <div className="absolute left-1/2 top-full z-50 -translate-x-1/2 pt-2">
          <div className="w-[min(680px,calc(100vw-2rem))] rounded-2xl border border-border-light bg-white p-4 shadow-lg">
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
                      src={firstRenderableImageSrc(product.images?.[0])}
                      alt={productShortName(product)}
                      fill
                      sizes="48px"
                      className="object-cover"
                      fallbackId={product.id}
                      deliveryPreset="thumbnail"
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-ink">
                      {productShortName(product)}
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

/** Turns "By Concern" into "Concerns" for the per-tab "View All" link. */
function pluralizeTabLabel(label: string): string {
  const base = label.replace(/^\s*by\s+/i, "").trim() || label.trim();

  if (/[^aeiou]y$/i.test(base)) return `${base.slice(0, -1)}ies`;
  if (/s$/i.test(base)) return base;
  return `${base}s`;
}

/** Groups items by their `group` label, preserving the admin's item order. */
function groupMegaMenuItems(items: MegaMenuItem[]): Array<[string, MegaMenuItem[]]> {
  const groups: Array<[string, MegaMenuItem[]]> = [];

  for (const item of items) {
    const key = item.group?.trim() || "More";
    const existing = groups.find(([label]) => label === key);

    if (existing) {
      existing[1].push(item);
    } else {
      groups.push([key, [item]]);
    }
  }

  return groups;
}

/** Shared link treatment for every item list in the panel. */
const MEGA_MENU_ITEM_CLASS =
  "block text-[13px] leading-5 text-ink/70 transition-colors hover:text-accent";

/** Mirrors the three-column layout so the panel does not jump as data lands. */
function MegaMenuSkeleton() {
  return (
    <div aria-hidden="true" className="grid grid-cols-3 gap-x-8 gap-y-7">
      {[0, 1, 2].map((column) => (
        <div key={column} className="min-w-0">
          <Skeleton className="h-3.5 w-28" />
          <Skeleton className="mt-2.5 h-0.5 w-10" />
          <div className="mt-3.5 space-y-2">
            {[0, 1, 2, 3, 4, 5].map((row) => (
              <Skeleton key={row} className="h-3.5 w-24" />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

/**
 * The pre-mega-menu panel. Rendered only when the admin-curated fetch yields
 * nothing, so the navbar always has a usable Shop menu.
 */
function MegaMenuFallback({
  columns,
  onNavigate,
}: {
  columns: MegaMenuColumn[];
  onNavigate: () => void;
}) {
  return (
    <div className="grid grid-cols-5 gap-x-6 gap-y-6">
      {columns.map((column) => (
        <div key={column.id} className="min-w-0">
          <NavigationItem
            label={column.label}
            href={column.href}
            comingSoon={column.comingSoon}
            onClick={onNavigate}
            className="block text-[13px] font-bold uppercase tracking-[0.14em] text-ink transition-colors hover:text-accent"
          />
          <span
            aria-hidden="true"
            className="mt-2.5 block h-0.5 w-10 rounded-full bg-accent"
          />
          <ul className="mt-3.5 space-y-2">
            {column.links.map((link) => (
              <li key={link.label}>
                <NavigationItem
                  label={link.label}
                  href={link.href}
                  comingSoon={link.comingSoon}
                  onClick={onNavigate}
                  className={MEGA_MENU_ITEM_CLASS}
                />
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}

/**
 * One fixed column: heading, accent rule, then its own capped item list.
 *
 * Self-contained on purpose — every column renders at once, so a heading's
 * position never depends on how many items a neighbouring section holds.
 */
function MegaMenuTabColumn({
  tab,
  onNavigate,
}: {
  tab: MegaMenuTab;
  onNavigate: () => void;
}) {
  const cap = Math.max(1, tab.maxItems);
  const shown = tab.items.slice(0, cap);
  const hasMore = tab.items.length > shown.length;
  const groups = tab.grouped ? groupMegaMenuItems(shown) : null;
  const headingId = `mega-menu-heading-${tab.id}`;

  return (
    <div className="min-w-0">
      <p
        id={headingId}
        className="text-[13px] font-bold uppercase tracking-[0.14em] text-ink"
      >
        {tab.label}
      </p>
      <span
        aria-hidden="true"
        className="mt-2.5 block h-0.5 w-10 rounded-full bg-accent"
      />

      {groups ? (
        <div className="mt-3.5 space-y-5">
          {groups.map(([group, items]) => (
            <div key={group}>
              <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-ink/50">
                {group}
              </p>
              <ul className="mt-2 space-y-2">
                {items.map((item) => (
                  <li key={item.id}>
                    <NavigationItem
                      label={item.label}
                      href={megaMenuTargetHref(item.target)}
                      onClick={onNavigate}
                      className={MEGA_MENU_ITEM_CLASS}
                    />
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      ) : (
        <ul aria-labelledby={headingId} className="mt-3.5 space-y-2">
          {shown.map((item) => (
            <li key={item.id}>
              <NavigationItem
                label={item.label}
                href={megaMenuTargetHref(item.target)}
                onClick={onNavigate}
                className={MEGA_MENU_ITEM_CLASS}
              />
            </li>
          ))}
        </ul>
      )}

      {hasMore ? (
        <Link
          href={MEGA_MENU_VIEW_ALL_HREF}
          onClick={onNavigate}
          className="mt-4 inline-flex items-center gap-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-accent transition-colors hover:text-accent-dark"
        >
          View All {pluralizeTabLabel(tab.label)}
          <ArrowRight className="h-3 w-3" />
        </Link>
      ) : null}
    </div>
  );
}

/**
 * Every section side by side, all visible at once.
 *
 * Replaces the tab strip that swapped one section into view at a time: the
 * three headings now sit in one fixed row and never move, so nothing shifts
 * when one section holds more items than its neighbours.
 */
function MegaMenuColumns({
  tabs,
  onNavigate,
}: {
  tabs: MegaMenuTab[];
  onNavigate: () => void;
}) {
  return (
    <div className="grid grid-cols-3 gap-x-8 gap-y-7">
      {tabs.map((tab) => (
        <MegaMenuTabColumn key={tab.id} tab={tab} onNavigate={onNavigate} />
      ))}
    </div>
  );
}

function ShopNavItem({
  panelTop,
  label,
  href,
  fallbackColumns,
}: {
  panelTop: number;
  label: string;
  href: string;
  fallbackColumns: MegaMenuColumn[];
}) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const isActive = isActiveNavPath(pathname, href);
  const containerRef = useRef<HTMLDivElement>(null);
  const closeTimer = useRef<number | null>(null);

  const { data, isLoading } = useMegaMenu();
  const tabs = data?.tabs ?? [];
  const usingFallback = !isLoading && tabs.length === 0;

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

  const handlePanelLeave = () => {
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
        href={href}
        aria-current={isActive ? "page" : undefined}
        className={navLinkClass(isActive)}
      >
        {label}
      </Link>

      {open && (
        <div
          onMouseEnter={cancelClose}
          onMouseLeave={handlePanelLeave}
          className="fixed left-1/2 z-[90] w-[min(700px,calc(100vw-2rem))] -translate-x-1/2 overflow-y-auto overscroll-contain rounded-base border border-border-light bg-white px-8 py-6 shadow-lg"
          style={{
            top: panelTop,
            maxHeight: `calc(100dvh - ${panelTop + 16}px)`,
          }}
        >
          {isLoading && tabs.length === 0 ? (
            <MegaMenuSkeleton />
          ) : usingFallback ? (
            <MegaMenuFallback
              columns={fallbackColumns}
              onNavigate={() => setOpen(false)}
            />
          ) : (
            <MegaMenuColumns tabs={tabs} onNavigate={() => setOpen(false)} />
          )}
        </div>
      )}
    </div>
  );
}

function DesktopNavLinks({ panelTop }: { panelTop: number }) {
  const pathname = usePathname();

  return (
    <>
      {PRIMARY_NAV.map((entry) => {
        if (entry.kind === "mega") {
          return (
            <ShopNavItem
              key={entry.id}
              panelTop={panelTop}
              label={entry.label}
              href={entry.href}
              fallbackColumns={entry.columns}
            />
          );
        }

        if (entry.kind === "brands") {
          return <BrandsNavItem key={entry.id} />;
        }

        if (entry.kind === "combo") {
          return <ComboNavItem key={entry.id} />;
        }

        const isActive = isActiveNavPath(pathname, entry.kind === "link" ? entry.href : undefined);

        return (
          <NavigationItem
            key={entry.id}
            label={entry.label}
            href={entry.kind === "link" ? entry.href : undefined}
            comingSoon={entry.kind === "soon"}
            active={isActive}
            className={navLinkClass(isActive)}
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
    ? "flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-ink/70 transition-colors hover:bg-ink/[0.04] hover:text-ink"
    : "rounded-full p-2.5 text-ink/70 transition-colors hover:bg-ink/[0.04] hover:text-ink";
  const badgeClassName = compact
    ? "absolute -right-1 -top-1 flex h-[18px] w-[18px] items-center justify-center rounded-full text-[9px] font-bold text-white"
    : "absolute -right-0.5 -top-0.5 flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold text-white";
  const iconSize = compact ? "h-[18px] w-[18px]" : "h-5 w-5";

  return (
    <div className={`relative z-10 flex items-center ${compact ? "gap-0" : "gap-1"}`}>
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
          <span className={`${badgeClassName} bg-brand-500`}>{wishlistCount}</span>
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
    // The bars slide via `top` (not `transform`, which would trap the
    // mega-menu's stacking context and break its `position: fixed`).
    // Measure the shown position so the panel aligns to the bar, not its offset.
    const measureBottom = (element: HTMLElement | null) => {
      if (!element) return null;
      const topOffset = parseFloat(getComputedStyle(element).top);
      return (
        element.getBoundingClientRect().bottom -
        (Number.isNaN(topOffset) ? 0 : topOffset)
      );
    };

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

      const defaultNavBottom = measureBottom(desktopDefaultNavRef.current);
      if (defaultNavBottom !== null) {
        setDefaultDesktopNavBottom(defaultNavBottom);
      }

      const compactNavBottom = measureBottom(desktopCompactNavRef.current);
      if (compactNavBottom !== null) {
        setCompactDesktopNavBottom(compactNavBottom);
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
          <div className="relative mx-auto flex h-16 max-w-[1400px] items-center justify-between gap-2 px-2.5 sm:px-4">
            <div className="relative z-10 flex items-center gap-0.5">
              <MobileMenu />
              <button
                onClick={() => setSearchModalOpen(true)}
                className="flex h-10 w-10 items-center justify-center rounded-full text-ink/70 transition-colors hover:bg-ink/[0.04] hover:text-ink"
                aria-label="Search"
              >
                <Search className="h-5 w-5" />
              </button>
            </div>

            <BrandLogo
              size="md"
              variant={showCompactDesktopNav ? "icon" : "full"}
              className="absolute left-1/2 top-1/2 max-w-[38%] -translate-x-1/2 -translate-y-1/2 [&>img]:max-h-7 [&>img]:w-auto max-[374px]:max-w-[32%] max-[374px]:[&>img]:h-6"
              priority
            />

            <HeaderIcons compact />
          </div>
        </div>
      </header>

      <header
        ref={desktopHeaderRef}
        className="relative z-[70] hidden bg-white lg:block"
      >
        <div
          ref={desktopMainHeaderRef}
          className="border-b border-border-light"
        >
          <div className="mx-auto flex h-[80px] max-w-[1400px] items-center justify-between px-6">
            <BrandLogo
              size="lg"
              variant="full"
              className="shrink-0"
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
                  className="w-full rounded-full border-none bg-ink/[0.04] py-3 pl-12 pr-10 text-sm text-ink outline-hidden transition-all placeholder:text-ink/40 focus:bg-ink/[0.06]"
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
          className={`relative border-b border-border-light bg-white transition-[opacity,top] ${COMPACT_NAV_TRANSITION} ${showCompactDesktopNav
            ? "pointer-events-none -top-1 opacity-0"
            : "top-0 opacity-100"
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
        className={`fixed left-0 right-0 z-[80] hidden border-b border-border-light/90 bg-white transition-[opacity,top] ${COMPACT_NAV_TRANSITION} lg:block ${showCompactDesktopNav
          ? "top-0 opacity-100"
          : "pointer-events-none -top-3 opacity-0"
          }`}
      >
        <div className="mx-auto grid h-[60px] max-w-[1400px] grid-cols-[auto_1fr_auto] items-center gap-8 px-6">
          <BrandLogo
            size="md"
            variant="icon"
            className={`transition-opacity ${COMPACT_NAV_FADE} ${showCompactDesktopNav ? "opacity-100" : "opacity-0"
              }`}
            priority
          />

          <nav className="flex items-center justify-center gap-8">
            <DesktopNavLinks panelTop={compactDesktopNavBottom} />
          </nav>

          <div
            className={`transition-opacity ${COMPACT_NAV_FADE} ${showCompactDesktopNav ? "opacity-100" : "opacity-0"
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
