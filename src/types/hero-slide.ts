/**
 * One homepage hero slide, as the storefront reads it.
 *
 * A slide is a poster image plus the URL it opens. No headline, badge or CTA is
 * built in code — the artwork carries them.
 */
export type HeroSlide = {
  id: string;
  imageUrl: string;
  targetUrl: string;
  altText?: string;
  order: number;
  isActive: boolean;
};
