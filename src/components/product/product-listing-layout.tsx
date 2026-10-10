"use client";

import { useState, type ReactNode } from "react";
import { SlidersHorizontal, X } from "lucide-react";
import {
  PLP_CONTENT_COLUMN_CLASSES,
  PLP_FRAME_CLASSES,
  PRODUCT_SIDEBAR_CLASSES,
} from "@/lib/product-grid";

/**
 * The shell every product-listing page shares: filters, toolbar, grid.
 *
 * Used by the shop today, and intended for the category, concern, ingredient and
 * search listings as they arrive. Before this, the arrangement lived inside
 * `shop/page.tsx`, so each new listing would have re-derived it — and the toolbar
 * alignment was already being held together by a magic `lg:ml-[272px]` offset that
 * had to be kept in step with the sidebar's width by hand.
 *
 * ## The shape, and why it is two widths and not one
 *
 * The filter panel sits OUTSIDE the content column, in the whitespace a wider
 * 1600px canvas opens up. The content column stays the site's standard centred box,
 * so the product cards line up with the homepage and every other public page.
 *
 * That box is `max-w-[1200px]`, not `max-w-7xl`. `1200px` is what the homepage's
 * sections (`home-section-content`), `/about`, `/blog` and `/brands` all use; the
 * only `max-w-7xl` on the site is the footer. Using 1280px here would have put the
 * cards 40px wider on each side than every neighbouring page — the opposite of the
 * alignment this component exists to guarantee.
 *
 * Note the honest limit of that guarantee: the product column is centred in the
 * space REMAINING after the sidebar, so it sits `(sidebar + gap) / 2` to the right of
 * the homepage's column — about 148px at the 1600px cap. To land the cards exactly
 * on the homepage's centre line, the sidebar would have to live in the gutter the
 * centred box leaves free, which needs roughly 1780px of viewport before a 256px
 * panel fits beside a 1200px column. Below that the choice is between a shifted
 * column (this) and no inline filters at all on ordinary laptops.
 */

/** How far the sticky sidebar sits below the viewport top. */
const SIDEBAR_STICKY_TOP = "sticky top-24";

type ProductListingLayoutProps = {
  /** Full-width block above everything — the listing's hero or title band. */
  banner?: ReactNode;
  /**
   * The filter panel, rendered twice: in the desktop sidebar and in the mobile
   * drawer. Both copies are mounted; each is hidden at the other's breakpoint, which
   * is how the page already worked.
   */
  filters: ReactNode;
  /** Badge on the mobile trigger. */
  filterCount?: number;
  /** Result count for the drawer's apply button. */
  resultCount?: number;
  /** Row above the grid: search, count, active-filter chips, sort. */
  toolbar?: ReactNode;
  /** Sits beside the mobile filter trigger — typically the compact sort control. */
  mobileToolbar?: ReactNode;
  children: ReactNode;
};

export function ProductListingLayout({
  banner,
  filters,
  filterCount = 0,
  resultCount,
  toolbar,
  mobileToolbar,
  children,
}: ProductListingLayoutProps) {
  const [filtersOpen, setFiltersOpen] = useState(false);

  return (
    <div className={PLP_FRAME_CLASSES}>
      {banner}

      <div className="flex flex-col gap-6 lg:flex-row lg:gap-10">
        <aside className={PRODUCT_SIDEBAR_CLASSES}>
          <div className={SIDEBAR_STICKY_TOP}>{filters}</div>
        </aside>

        <div className="min-w-0 flex-1">
          {/* The site's standard centred content box. Everything the customer reads
              as "the listing" lives inside it, which is what keeps the cards on the
              same centre line as the rest of the site. */}
          <div className={PLP_CONTENT_COLUMN_CLASSES}>
            {toolbar}

            {/* Mobile is the only case with no sidebar, so it is the only case that
                needs a way in. */}
            <div className="mb-6 flex flex-wrap items-center justify-between gap-3 lg:hidden">
              <button
                type="button"
                onClick={() => setFiltersOpen(true)}
                className="inline-flex h-11 min-w-[132px] shrink-0 items-center justify-center gap-2 rounded-full border border-border bg-white px-4 text-sm font-medium text-ink shadow-sm"
              >
                <SlidersHorizontal className="h-4 w-4" />
                Filters{filterCount > 0 ? ` (${filterCount})` : ""}
              </button>
              {mobileToolbar}
            </div>

            {children}
          </div>
        </div>
      </div>

      {filtersOpen && (
        <div className="fixed inset-0 z-50 lg:hidden" role="dialog" aria-modal="true">
          <div className="absolute inset-0 bg-ink/30" onClick={() => setFiltersOpen(false)} />
          <div className="absolute inset-y-0 left-0 flex w-[min(92vw,360px)] flex-col bg-surface px-5 pt-5 shadow-lg">
            <button
              type="button"
              onClick={() => setFiltersOpen(false)}
              className="absolute right-2 top-2 flex h-10 w-10 items-center justify-center rounded-full text-ink/50 transition-colors hover:bg-ink/[0.04] hover:text-ink"
              aria-label="Close filters"
            >
              <X className="h-5 w-5" />
            </button>
            <div className="min-h-0 flex-1 overflow-y-auto pb-5 pr-1">{filters}</div>
            <div className="sticky bottom-0 -mx-5 border-t border-border-light bg-surface px-5 py-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
              <button
                type="button"
                onClick={() => setFiltersOpen(false)}
                className="flex h-11 w-full items-center justify-center rounded-full bg-accent px-5 text-sm font-semibold text-white transition-colors hover:bg-accent-dark"
              >
                {typeof resultCount === "number"
                  ? `Show ${resultCount} Product${resultCount === 1 ? "" : "s"}`
                  : "Show results"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
