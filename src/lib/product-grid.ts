/**
 * The one product-grid definition, shared by every listing surface.
 *
 * It lives in a plain module rather than beside `ProductListingLayout` on purpose.
 * That layout is a client component, and importing a *value* from a `"use client"`
 * module into a server component hands back a client reference, not the string —
 * so a route-level `loading.tsx` (which is a server component) could not use a
 * constant exported from there. It would type-check and then fail at runtime, which
 * is the worst kind of failure to leave for later.
 *
 * Exported as one constant so a listing page, its loading skeleton and its empty
 * state cannot drift apart: a skeleton that does not match the grid it stands in for
 * is worse than no skeleton, because the layout jumps when the data lands.
 *
 * Two columns on the smallest screens, so a phone shows a usable pair of cards
 * rather than one oversized one.
 */
export const PRODUCT_GRID_CLASSES =
  "grid grid-cols-2 gap-x-4 gap-y-8 md:grid-cols-3 md:gap-x-6 xl:grid-cols-4";

/**
 * The sidebar-column geometry, shared for the same reason: the route-level skeleton
 * has to reserve the same space the real layout uses, or the page shifts when the
 * data arrives.
 */
export const PRODUCT_SIDEBAR_CLASSES = "hidden w-64 shrink-0 lg:block";

/** The centred content column every public page aligns to. */
export const PLP_CONTENT_COLUMN_CLASSES = "mx-auto w-full max-w-[1200px]";

/**
 * The wider canvas the filter sidebar sits in, outside that column.
 *
 * Horizontal gutters are NOT here: the banner is rendered inside the standard
 * page box (`PAGE_BOX_CLASSES`) so it is exactly as wide as the hero on every
 * other page, while the sidebar + grid keep their own gutter below it.
 */
export const PLP_FRAME_CLASSES =
  "mx-auto w-full max-w-[1600px] py-6 sm:py-10";

/** Horizontal gutter shared by the sidebar and the content column. */
export const PLP_GUTTER_CLASSES = "px-4 sm:px-6 lg:px-8";
