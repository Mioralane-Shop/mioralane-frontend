/**
 * Typography shared by the product detail page and the tab components inside it.
 *
 * The point is one definition per level, so the eight section labels on that page
 * cannot drift apart the way they had: the "Key Ingredients" header was an `<h3>`,
 * and the unlayered `h1–h6` rule in `globals.css` forces the display face (Lora) and
 * weight 500 on it — it ignored its own `font-semibold` and rendered in a different
 * family from every other section label.
 *
 * Colours are deliberate dark warm neutrals. The previous pair (#6E6966 headings,
 * #5F5A57 body) measured around 5:1 and read washed out at 11px on the near-white
 * surfaces; these keep the same warm hue at roughly 10:1.
 */

/**
 * The small uppercase label that introduces a section ("About This Product",
 * "Best For", "How To Use", …). Render it on a `<p>`, not a heading element:
 * the unlayered `h1–h6` rule wins over these utilities, so an `<h3>` would silently
 * come out in Lora.
 */
export const SECTION_EYEBROW =
  "text-[11px] font-semibold uppercase tracking-[0.22em] text-[#3A3531]";

/** Body copy inside tab panels and cards. */
export const BODY_COPY = "text-sm leading-7 text-[#453F3B]";

/** The pill used for "Best For" and "Key Ingredients" values. */
export const SPEC_CHIP =
  "rounded-full border border-[#E4DDD6] bg-[#FCFAF8] px-3.5 py-1.5 text-xs font-medium text-[#453F3B]";
