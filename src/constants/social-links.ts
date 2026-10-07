import { SITE_WHATSAPP } from "@/constants/site";

/**
 * Social profiles shown in the storefront footer.
 *
 * ⚠️ HANDLES NEED CONFIRMING. Only Instagram is evidenced in the codebase
 * (`components/common/instagram-section.tsx` links to `instagram.com/mioralane`).
 * Facebook and TikTok are obvious guesses and MUST be replaced with the real
 * profiles before this ships — a wrong handle sends customers to a stranger's
 * account.
 *
 * WhatsApp reuses `SITE_WHATSAPP` (`constants/site.ts`) rather than a second
 * hard-coded number, so the footer, the contact page, the track-order page and
 * the cart's "Order via WhatsApp" button can never disagree. That constant is
 * itself a placeholder — see its own TODO.
 */

/** Keys into `components/layout/social-icons.tsx`. Kept here so the two cannot drift. */
export type SocialIconName = "instagram" | "facebook" | "tiktok" | "whatsapp";

export type SocialLink = {
  name: string;
  href: string;
  icon: SocialIconName;
};

export const SOCIAL_LINKS: readonly SocialLink[] = [
  {
    name: "Instagram",
    // TODO: confirm handle — matches the CTA in instagram-section.tsx.
    href: "https://www.instagram.com/mioralane/",
    icon: "instagram",
  },
  {
    name: "Facebook",
    // TODO: confirm handle (placeholder).
    href: "https://www.facebook.com/mioralane",
    icon: "facebook",
  },
  {
    name: "TikTok",
    // TODO: confirm handle (placeholder).
    href: "https://www.tiktok.com/@mioralane",
    icon: "tiktok",
  },
  {
    name: "WhatsApp",
    // TODO: confirm number — resolves to the shared `SITE_WHATSAPP` placeholder.
    href: `https://wa.me/${SITE_WHATSAPP}`,
    icon: "whatsapp",
  },
];
