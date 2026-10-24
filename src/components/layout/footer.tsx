import Link from "next/link";
import { SITE_NAME } from "@/constants/site";
import { SOCIAL_LINKS } from "@/constants/social-links";
import { SocialIcon } from "@/components/layout/social-icons";

const footerLinks = {
  shop: {
    title: "Shop",
    links: [
      { label: "All Products", href: "/shop" },
      { label: "New Arrivals", href: "/shop?tab=new" },
      { label: "Bundles", href: "/combo" },
    ],
  },
  company: {
    title: "Company",
    links: [
      { label: "About Us", href: "/about" },
      { label: "Contact", href: "/contact" },
      { label: "Brands", href: "/brands" },
      { label: "Authenticity Policy", href: "/authenticity" },
    ],
  },
  help: {
    title: "Help",
    links: [
      { label: "Delivery", href: "/delivery" },
      { label: "Returns", href: "/returns" },
      { label: "Track Order", href: "/track-order" },
      { label: "FAQ", href: "/faq" },
    ],
  },
  legal: {
    title: "Legal",
    links: [
      { label: "Privacy Policy", href: "/privacy" },
      { label: "Terms of Service", href: "/terms" },
    ],
  },
};

/** Bottom-bar trust points, rendered dot-separated on one line. */
const TRUST_POINTS = ["COD", "Nationwide", "100% Authentic"];

export function Footer() {
  return (
    <footer className="bg-[#1a1a1f] text-white py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10">
          {/* Brand + social */}
          <div className="md:col-span-4">
            <Link
              href="/"
              className="font-serif text-xl font-medium tracking-tight text-white transition-colors hover:text-white/80"
            >
              {SITE_NAME}
            </Link>
            <p className="mt-3 text-sm text-white/60">
              Korean skincare, curated.
            </p>
            <ul className="mt-6 flex items-center gap-3">
              {SOCIAL_LINKS.map((social) => (
                <li key={social.name}>
                  <a
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`${SITE_NAME} on ${social.name}`}
                    className="inline-flex h-9 w-9 items-center justify-center rounded-full text-white/50 transition-colors hover:bg-white/10 hover:text-white"
                  >
                    <SocialIcon name={social.icon} className="h-5 w-5" />
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Link columns */}
          <nav
            aria-label="Footer"
            className="md:col-span-8 grid grid-cols-2 sm:grid-cols-4 gap-8"
          >
            {Object.values(footerLinks).map((section) => (
              <div key={section.title}>
                <h4 className="mb-4 text-sm font-semibold text-white/90">
                  {section.title}
                </h4>
                <ul className="space-y-3">
                  {section.links.map((link) => (
                    <li key={link.label}>
                      <Link
                        href={link.href}
                        className="text-sm text-white/60 transition-colors hover:text-white"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </nav>
        </div>

        <div className="mt-10 pt-6 border-t border-white/10 flex flex-col sm:flex-row justify-between items-center gap-3 text-xs text-white/50">
          <p>&copy; 2026 {SITE_NAME}</p>
          <p className="whitespace-nowrap">{TRUST_POINTS.join(" · ")}</p>
        </div>
      </div>
    </footer>
  );
}
