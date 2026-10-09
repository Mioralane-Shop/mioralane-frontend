/**
 * A storefront brand, as `GET /api/brands` returns it.
 *
 * Mirrors `brand.service.ts`'s `BrandView` on the backend. Two details are worth
 * naming because they differ from the shape a client might assume:
 *
 *   - the identifier is `id`, not `_id` — the backend serializes explicitly, so
 *     the raw document never crosses the wire;
 *   - `logoUrl`, `logoAlt`, `logoWidth` and `logoHeight` are **absent** rather
 *     than empty strings when a brand has no artwork, which is most of them.
 *     Test with `brand.logoUrl` truthiness, not `!== undefined`.
 */
export type Brand = {
  id: string;
  name: string;
  slug: string;
  logoUrl?: string;
  logoAlt?: string;
  logoWidth?: number;
  logoHeight?: number;
  showInNavbar: boolean;
  showInMarquee: boolean;
  visible: boolean;
  order: number;
  createdAt: string;
  updatedAt: string;
};
