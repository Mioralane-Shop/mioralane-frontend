import type { MegaMenuTarget, MegaMenuTargetKind } from "@/types/mega-menu";

/**
 * Maps a stored destination to the shop page's query-string key.
 *
 * The shop page reads `concern` (aliasing it to `skinConcern` for the API) and
 * passes `ingredient` straight through to the products API.
 */
const TARGET_QUERY_KEYS: Record<MegaMenuTargetKind, string> = {
  category: "category",
  concern: "concern",
  ingredient: "ingredient",
  skinType: "skinType",
  brand: "brand",
  search: "search",
};

/** Where the "View All" link under every tab points. */
export const MEGA_MENU_VIEW_ALL_HREF = "/shop";

/**
 * Composes the shop URL for a mega-menu item. Values are always encoded, so a
 * stored value can never break out of the query string.
 */
export const megaMenuTargetHref = (target: MegaMenuTarget): string => {
  const value = target.value.trim();
  if (!value) return MEGA_MENU_VIEW_ALL_HREF;

  const params = new URLSearchParams({ [TARGET_QUERY_KEYS[target.kind]]: value });
  return `/shop?${params.toString()}`;
};
