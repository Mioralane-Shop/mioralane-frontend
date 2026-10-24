/**
 * Which product name to show, in one place.
 *
 * A product carries two names and they are not interchangeable:
 *
 *   - `title`       the full name — what the slug is built from, what orders snapshot,
 *                   and what the API exposes as `name`
 *   - `shortName`   what a card, a search result, a cart row or a wishlist row prints;
 *                   blank means "use the full name"
 *
 * `shortName` is optional on the type, deliberately: the API resolves a blank one to
 * the title, but an older deployment's response might not carry the field at all — and
 * a card handed `shortName: undefined` that printed nothing would be a blank tile,
 * the worst possible fallback. That is why every reader goes through these two
 * functions rather than reading the field directly.
 *
 * `name` is in the chain because the API aliases `title` to it; `title` is there for
 * the admin payloads, which still speak in `title`.
 */

type NamedProduct = {
  shortName?: string | null;
  name?: string | null;
  title?: string | null;
};

/** What the last resort prints when a product somehow has no name at all. */
const UNNAMED = "Untitled product";

/** The name for cards, grids, search results, cart and wishlist rows. */
export function productShortName(product: NamedProduct): string {
  return product.shortName || product.name || product.title || UNNAMED;
}

/** The full product name — the details page heading and anything else with room. */
export function productFullName(product: NamedProduct): string {
  return product.name || product.title || UNNAMED;
}
