/**
 * Canonical product URLs: `/product/[brandSlug]/[productSlug]`.
 *
 * The brand segment mirrors the breadcrumb the product page already shows. It is
 * **cosmetic** — the API still resolves a product by its slug alone, and the
 * nested page verifies that the brand in the URL matches the product it found.
 * That keeps every existing slug valid, so no product is re-keyed by this change.
 *
 * `brandSlug` comes from the API (computed with the backend's Unicode-aware
 * `slugify`). The local fallback exists only for data that predates it — the
 * bundled catalogue and anything cached from an older deployment.
 *
 * ## No imports on purpose
 *
 * `lib/seo/sitemap.ts` and `lib/seo/json-ld.ts` are loaded by
 * `scripts/verify-seo.ts` under Node's type stripping, so this module must stay
 * free of `@/` aliases and of anything that pulls in React or a bundler. The
 * fallback slugifier is therefore local, and mirrors
 * `mioralane-backend/src/utils/slugify.ts` (NFKD, combining marks kept, non-word
 * runs collapsed to `-`).
 */

type Branded = {
  brandSlug?: string | null;
  brand?: string | null;
};

type Addressable = Branded & {
  slug?: string | null;
};

function fallbackSlug(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^\p{L}\p{N}\p{M}\u200c\u200d]+/gu, "-")
    .replace(/^-+|-+$/g, "");
}

/** The brand segment for a product URL, or `""` when the product has no brand. */
export function productBrandSlug(product: Branded): string {
  const provided = (product.brandSlug ?? "").trim();
  if (provided) return provided;

  const brand = (product.brand ?? "").trim();
  return brand ? fallbackSlug(brand) : "";
}

/**
 * The path to a product page.
 *
 * Falls back to the legacy flat path when either segment is missing, which keeps
 * an incomplete product object from producing `/product//undefined` — and that
 * flat path still resolves, because `/product/[brand]` redirects it.
 */
export function productPath(product: Addressable): string {
  const slug = (product.slug ?? "").trim();
  const brand = productBrandSlug(product);

  if (!slug) return "/shop";
  if (!brand) return `/product/${slug}`;

  return `/product/${brand}/${slug}`;
}
