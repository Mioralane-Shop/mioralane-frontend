// Explicit .ts extension: `src/lib/seo/json-ld.ts` (and therefore
// `scripts/verify-seo.ts`, which runs under Node's type stripping) imports this
// module, and Node resolves relative specifiers by their real file name.
import { SITE_WHATSAPP } from "./site.ts";

/**
 * Social profiles shown in the storefront footer.
 *
 * Handles confirmed by the business on 2026-10-27, shown in this order:
 *   - Facebook   facebook.com/share/1HUHZXPHVX
 *   - Instagram  instagram.com/mioralane.bd
 *   - WhatsApp   +880 1346-092869
 *
 * WhatsApp reuses `SITE_WHATSAPP` (`constants/site.ts`) rather than a second
 * hard-coded number, so the footer, the contact page, the track-order page and
 * the cart's "Order via WhatsApp" button can never disagree.
 */

/** Keys into `components/layout/social-icons.tsx`. Kept here so the two cannot drift. */
export type SocialIconName = "instagram" | "facebook" | "whatsapp";

export type SocialLink = {
  name: string;
  href: string;
  icon: SocialIconName;
};

export const SOCIAL_LINKS: readonly SocialLink[] = [
  {
    name: "Facebook",
    href: "https://www.facebook.com/share/1HUHZXPHVX/",
    icon: "facebook",
  },
  {
    name: "Instagram",
    href: "https://www.instagram.com/mioralane.bd?cplk=NTk0emxuMWowdWV4",
    icon: "instagram",
  },
  {
    name: "WhatsApp",
    href: `https://wa.me/${SITE_WHATSAPP}`,
    icon: "whatsapp",
  },
];
