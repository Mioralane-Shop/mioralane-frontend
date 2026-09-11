"use client";

import Link from "next/link";
import { useState, useMemo } from "react";
import { Menu, ChevronDown, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { NavigationItem } from "@/components/layout/navigation-item";
import { BRANDS } from "@/constants/site";
import { useAuthStore } from "@/store/auth.store";

type Tab = "menu" | "brands" | "support";

const SKINCARE_LINKS = [
  { label: "Cleansers", href: "/shop?category=cleansers" },
  { label: "Moisturizers", href: "/shop?category=moisturizers" },
  { label: "Toners", href: "/shop?category=toners" },
  { label: "Treatments", comingSoon: true },
  { label: "Exfoliators", comingSoon: true },
  { label: "Masks", href: "/shop?category=masks" },
  { label: "Lip & Eye Care", comingSoon: true },
  { label: "Sunscreens", href: "/shop?category=sun-care" },
];

const CONCERN_LINKS = [
  { label: "Acne", href: "/shop?concern=acne" },
  { label: "Anti-Aging", href: "/shop?concern=anti-aging" },
  { label: "Dryness / Hydration", href: "/shop?concern=hydration" },
  { label: "Fungal Acne Safe", comingSoon: true },
  { label: "Hyperpigmentation", comingSoon: true },
  { label: "Redness", comingSoon: true },
  { label: "Sensitivity", href: "/shop?concern=sensitive" },
  { label: "Oil Control & Pore Care", comingSoon: true },
];

const DISCOVER_LINKS = [
  { label: "See All Products", href: "/shop" },
  { label: "Bestsellers", href: "/shop?bestSeller=true" },
  { label: "Shop By Collection", href: "/shop" },
  { label: "Vegan Skincare", comingSoon: true },
];

const MENU_GROUPS = [
  { id: "skincare", label: "Skincare", links: SKINCARE_LINKS },
  { id: "concerns", label: "Skin Concerns", links: CONCERN_LINKS },
  { id: "discover", label: "Discover", links: DISCOVER_LINKS },
];

const SORTED_BRANDS = [...BRANDS].sort((a, b) => a.localeCompare(b));

export function MobileMenu() {
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState<Tab>("menu");
  const [expanded, setExpanded] = useState<string | null>(null);

  const { isAuthenticated } = useAuthStore();

  const supportLinks = useMemo(() => [
    { label: isAuthenticated ? "My Account" : "Login", href: isAuthenticated ? "/profile" : "/login" },
    { label: "Shopping Cart", href: "/cart" },
    { label: "Order History", href: "/orders" },
    { label: "Wishlist", href: "/wishlist" },
    { label: "Mioralane Club", comingSoon: true },
    { label: "Shipping & Returns", href: "/returns" },
    { label: "Skincare Quiz", href: "/skincare-quiz" },
    { label: "Gift Cards", comingSoon: true },
    { label: "About Us", href: "/about" },
    { label: "Contact Us", href: "/contact" },
    { label: "FAQ", href: "/faq" },
  ], [isAuthenticated]);

  const close = () => setOpen(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <Button
        variant="ghost"
        size="icon"
        className="lg:hidden"
        onClick={() => setOpen(true)}
        aria-label="Open menu"
      >
        <Menu className="h-5 w-5" />
      </Button>
      <SheetContent
        side="left"
        className="w-[80%] p-0 [&>button.absolute]:text-white"
      >
        <div className="flex h-full flex-col">
          {/* Black top bar: three section names on the left, close X on the right */}
          <div className="flex h-12 items-center gap-1 bg-ink px-4">
            {(["menu", "brands", "support"] as Tab[]).map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`rounded-lg px-3.5 py-2 text-sm font-semibold transition-colors ${tab === t
                    ? "bg-white text-ink shadow-sm"
                    : "text-white/60 hover:text-white"
                  }`}
              >
                {t[0].toUpperCase() + t.slice(1)}
              </button>
            ))}
          </div>

          <div className="flex-1 overflow-y-auto p-3">
            {/* MENU TAB */}
            {tab === "menu" && (
              <div className="flex flex-col">
                <NavigationItem
                  label="Sales"
                  comingSoon
                  onClick={close}
                  className="flex items-center justify-between rounded-lg px-3 py-3 text-sm font-medium text-neutral-700 transition-colors hover:bg-brand-50 hover:text-brand-600"
                >
                  Sales
                  <ChevronRight className="h-4 w-4 text-neutral-400" />
                </NavigationItem>
                <NavigationItem
                  label="New"
                  href="/shop?sort=newest"
                  onClick={close}
                  className="flex items-center justify-between rounded-lg px-3 py-3 text-sm font-medium text-neutral-700 transition-colors hover:bg-brand-50 hover:text-brand-600"
                >
                  New
                  <ChevronRight className="h-4 w-4 text-neutral-400" />
                </NavigationItem>

                {MENU_GROUPS.map((group) => (
                  <div key={group.id} className="border-b border-brand-50">
                    <button
                      onClick={() =>
                        setExpanded(expanded === group.id ? null : group.id)
                      }
                      className="flex w-full items-center justify-between rounded-lg px-3 py-3 text-sm font-medium text-neutral-700 transition-colors hover:bg-brand-50 hover:text-brand-600"
                    >
                      {group.label}
                      <ChevronDown
                        className={`h-4 w-4 text-neutral-400 transition-transform ${expanded === group.id ? "rotate-180" : ""
                          }`}
                      />
                    </button>
                    {expanded === group.id && (
                      <div className="mb-2 ml-2 border-l border-brand-100 pl-2">
                        {group.links.map((link) => (
                          <NavigationItem
                            key={link.label}
                            label={link.label}
                            href={link.href}
                            comingSoon={link.comingSoon}
                            onClick={close}
                            className="block rounded-lg px-3 py-2 text-left text-sm text-neutral-600 transition-colors hover:bg-brand-50 hover:text-brand-600"
                          />
                        ))}
                      </div>
                    )}
                  </div>
                ))}

                <button
                  onClick={() => setTab("brands")}
                  className="flex items-center justify-between rounded-lg px-3 py-3 text-sm font-medium text-neutral-700 transition-colors hover:bg-brand-50 hover:text-brand-600"
                >
                  Brands
                  <ChevronRight className="h-4 w-4 text-neutral-400" />
                </button>
                <NavigationItem
                  label="Combo"
                  href="/combo"
                  onClick={close}
                  className="flex items-center justify-between rounded-lg px-3 py-3 text-sm font-medium text-neutral-700 transition-colors hover:bg-brand-50 hover:text-brand-600"
                >
                  Combo
                  <ChevronRight className="h-4 w-4 text-neutral-400" />
                </NavigationItem>
                <NavigationItem
                  label="Gift Cards"
                  comingSoon
                  onClick={close}
                  className="flex items-center justify-between rounded-lg px-3 py-3 text-sm font-medium text-neutral-700 transition-colors hover:bg-brand-50 hover:text-brand-600"
                >
                  Gift Cards
                  <ChevronRight className="h-4 w-4 text-neutral-400" />
                </NavigationItem>
                <NavigationItem
                  label="Blog"
                  href="/blog"
                  onClick={close}
                  className="flex items-center justify-between rounded-lg px-3 py-3 text-sm font-medium text-neutral-700 transition-colors hover:bg-brand-50 hover:text-brand-600"
                >
                  Blog
                  <ChevronRight className="h-4 w-4 text-neutral-400" />
                </NavigationItem>
                <NavigationItem
                  label="Win Review of the Month"
                  comingSoon
                  onClick={close}
                  className="flex items-center justify-between rounded-lg px-3 py-3 text-sm font-medium text-neutral-700 transition-colors hover:bg-brand-50 hover:text-brand-600"
                >
                  Win Review of the Month
                  <ChevronRight className="h-4 w-4 text-neutral-400" />
                </NavigationItem>
              </div>
            )}

            {/* BRANDS TAB */}
            {tab === "brands" && (
              <div className="flex flex-col">
                {SORTED_BRANDS.map((brand) => (
                  <Link
                    key={brand}
                    href={`/shop?brand=${encodeURIComponent(brand)}`}
                    onClick={close}
                    className="rounded-lg px-3 py-2 text-sm text-neutral-600 transition-colors hover:bg-brand-50 hover:text-brand-600"
                  >
                    {brand}
                  </Link>
                ))}
              </div>
            )}

            {/* SUPPORT TAB */}
            {tab === "support" && (
              <div className="flex flex-col">
                {supportLinks.map((item) => (
                  <NavigationItem
                    key={item.label}
                    label={item.label}
                    href={item.href}
                    comingSoon={item.comingSoon}
                    onClick={close}
                    className="flex items-center justify-between rounded-lg px-3 py-3 text-sm font-medium text-neutral-700 transition-colors hover:bg-brand-50 hover:text-brand-600"
                  >
                    <ChevronRight className="h-4 w-4 text-neutral-400" />
                  </NavigationItem>
                ))}
              </div>
            )}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
