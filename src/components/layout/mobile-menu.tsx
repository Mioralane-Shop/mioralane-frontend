"use client";

import Link from "next/link";
import { useState } from "react";
import { ChevronDown, ChevronRight, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { NavigationItem } from "@/components/layout/navigation-item";
import { PRIMARY_NAV } from "@/constants/navigation";
import { BRANDS } from "@/constants/site";
import { useCombos } from "@/hooks/use-combos";
import { cn, formatPrice } from "@/lib/utils";

const SORTED_BRANDS = [...BRANDS].sort((a, b) => a.localeCompare(b));

const rowClassName =
  "flex min-h-12 items-center rounded-lg px-3 text-sm font-medium text-neutral-700 transition-colors hover:bg-brand-50 hover:text-brand-600";
const childClassName =
  "block rounded-lg px-3 py-2 text-sm text-neutral-600 transition-colors hover:bg-brand-50 hover:text-brand-600";
const columnLabelClassName =
  "block px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-ink/70";

/**
 * Mobile drawer.
 *
 * Renders the SAME navigation model as the desktop rows (`PRIMARY_NAV` from
 * `@/constants/navigation`) — same items, labels, hierarchy and destinations.
 * Only the interaction changes: desktop hover panels become tap-to-expand rows.
 */
export function MobileMenu() {
  const [open, setOpen] = useState(false);
  const [expanded, setExpanded] = useState<string | null>(null);
  const { data: combos = [] } = useCombos();

  const close = () => setOpen(false);
  const toggle = (id: string) =>
    setExpanded((current) => (current === id ? null : id));

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

      <SheetContent side="left" className="w-[min(92vw,360px)] p-0">
        <nav className="flex h-full flex-col overflow-y-auto overscroll-contain px-3 pb-6 pt-14">
          {PRIMARY_NAV.map((entry) => {
            const isOpen = expanded === entry.id;
            const Chevron = isOpen ? ChevronDown : ChevronRight;

            // Plain link row (Blog) and the muted "coming soon" row (Sales).
            if (entry.kind === "link" || entry.kind === "soon") {
              return (
                <div key={entry.id} className="border-b border-brand-50">
                  <NavigationItem
                    label={entry.label}
                    href={entry.kind === "link" ? entry.href : undefined}
                    comingSoon={entry.kind === "soon"}
                    onClick={close}
                    className={cn(rowClassName, "w-full justify-between")}
                  >
                    <span className="flex-1 text-left">{entry.label}</span>
                    <ChevronRight className="h-4 w-4 shrink-0 text-neutral-400" />
                  </NavigationItem>
                </div>
              );
            }

            return (
              <div key={entry.id} className="border-b border-brand-50">
                <div className="flex items-center">
                  <NavigationItem
                    label={entry.label}
                    href={entry.href}
                    onClick={close}
                    className={cn(rowClassName, "min-w-0 flex-1")}
                  />
                  <button
                    type="button"
                    onClick={() => toggle(entry.id)}
                    aria-expanded={isOpen}
                    aria-label={`${isOpen ? "Collapse" : "Expand"} ${entry.label}`}
                    className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg text-neutral-400 transition-colors hover:text-neutral-700"
                  >
                    <Chevron className="h-4 w-4" />
                  </button>
                </div>

                {isOpen && entry.kind === "mega" && (
                  <div className="mb-3 ml-2 space-y-3 border-l border-brand-100 pl-2">
                    {entry.columns.map((column) => (
                      <div key={column.id}>
                        <NavigationItem
                          label={column.label}
                          href={column.href}
                          comingSoon={column.comingSoon}
                          onClick={close}
                          className={columnLabelClassName}
                        />
                        <ul className="mt-0.5 space-y-0.5">
                          {column.links.map((link) => (
                            <li key={link.label}>
                              <NavigationItem
                                label={link.label}
                                href={link.href}
                                comingSoon={link.comingSoon}
                                onClick={close}
                                className={childClassName}
                              />
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                )}

                {isOpen && entry.kind === "brands" && (
                  <ul className="mb-3 ml-2 space-y-0.5 border-l border-brand-100 pl-2">
                    {SORTED_BRANDS.map((brand) => (
                      <li key={brand}>
                        <Link
                          href={`/shop?brand=${encodeURIComponent(brand)}`}
                          onClick={close}
                          className={childClassName}
                        >
                          {brand}
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}

                {isOpen && entry.kind === "combo" && (
                  <div className="mb-3 ml-2 space-y-1 border-l border-brand-100 pl-2">
                    {combos.map((combo) => (
                      <Link
                        key={combo.id}
                        href={`/combo/${combo.slug}`}
                        onClick={close}
                        className="flex items-center justify-between gap-3 rounded-lg px-3 py-2 transition-colors hover:bg-brand-50"
                      >
                        <span className="min-w-0 flex-1 truncate text-sm text-neutral-600">
                          {combo.name}
                        </span>
                        <span className="shrink-0 text-sm font-semibold text-ink">
                          {formatPrice(combo.price)}
                        </span>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </nav>
      </SheetContent>
    </Sheet>
  );
}
