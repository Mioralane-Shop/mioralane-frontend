import { cn } from "@/lib/utils";

/**
 * The top-level navigation label: whether it is the section you are in, and the class
 * that says so.
 *
 * Both live here because the label is rendered by four different components — the Shop,
 * Brands and Combos dropdowns, plus plain links — that each carried their own copy of
 * the same class string. An active state added to one of them, or to three, is how a
 * navbar ends up inconsistent with itself.
 */

const NAV_LINK_BASE =
  "text-sm font-black uppercase tracking-wider transition-colors no-underline";

const NAV_LINK_IDLE = "text-ink/80 hover:text-ink";

/**
 * The active label: the accent colour plus a short underline.
 *
 * Colour alone is easy to miss here — the idle state is already a fairly dark
 * `text-ink/80`, so the shift to accent reads as a hover rather than a location. The
 * underline is what actually answers "am I here?", and it does so without turning the
 * label into a button.
 */
const NAV_LINK_ACTIVE =
  "relative text-accent after:absolute after:-bottom-1 after:left-0 after:right-0 after:h-[2px] after:rounded-full after:bg-accent";

/** The class for a top-level nav label, active or not. */
export function navLinkClass(isActive: boolean): string {
  return cn(NAV_LINK_BASE, isActive ? NAV_LINK_ACTIVE : NAV_LINK_IDLE);
}

/**
 * Whether `href` is the section the current path sits in.
 *
 * Exact match or a sub-path of it — the same test `promotion-campaign.tsx` already
 * uses. The query string is stripped first: the mega-menu's own links carry
 * `?category=…`, and `usePathname()` never includes a query, so comparing raw would
 * make those never match.
 *
 * A prefix match is what makes `/shop?brand=COSRX` and `/shop` both light up SHOP,
 * while `/brands` does not light it up despite sharing the leading slash.
 */
export function isActiveNavPath(
  pathname: string | null | undefined,
  href?: string | null,
): boolean {
  if (!pathname || !href) {
    return false;
  }

  const path = href.split("?")[0].replace(/\/+$/, "") || "/";

  if (path === "/") {
    return pathname === "/";
  }

  return pathname === path || pathname.startsWith(`${path}/`);
}
