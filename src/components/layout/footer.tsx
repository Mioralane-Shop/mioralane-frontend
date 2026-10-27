import Link from "next/link";
import { Banknote, ShieldCheck, Truck } from "lucide-react";
import { BrandLogo } from "@/components/layout/brand-logo";
import { SITE_NAME } from "@/constants/site";
import { SOCIAL_LINKS } from "@/constants/social-links";
import { SocialIcon } from "@/components/layout/social-icons";

type FooterSection = {
  title: string;
  links: Array<{ label: string; href: string }>;
  /** Optional small print under a column (e.g. where returns are covered). */
  note?: string;
};

const footerLinks: Record<string, FooterSection> = {
  shop: {
    title: "Shop",
    links: [
      { label: "All Products", href: "/shop" },
      { label: "New Arrivals", href: "/shop?tab=new" },
      { label: "Brands", href: "/brands" },
      { label: "Skincare Quiz", href: "/skincare-quiz" },
    ],
  },
  company: {
    title: "Company",
    links: [
      { label: "About Us", href: "/about" },
      { label: "Blog", href: "/blog" },
      { label: "Contact Us", href: "/contact" },
    ],
  },
  help: {
    title: "Help",
    links: [
      { label: "FAQ", href: "/faq" },
      { label: "Delivery", href: "/delivery" },
      { label: "My Orders", href: "/orders" },
    ],
  },
  policies: {
    title: "Policies",
    links: [
      { label: "Privacy Policy", href: "/privacy" },
      { label: "Terms & Conditions", href: "/terms" },
      { label: "Authenticity Policy", href: "/authenticity" },
    ],
  },
};

/** Bottom-bar trust points, each with a small icon. */
const TRUST_POINTS = [
  { icon: Banknote, label: "Cash on Delivery" },
  { icon: Truck, label: "Nationwide delivery" },
  { icon: ShieldCheck, label: "100% authentic" },
] as const;

export function Footer() {
  return (
    <footer className="bg-[#1a1a1f] py-12 text-white sm:py-14">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-12">
          {/* Brand and social */}
          <div className="lg:col-span-4">
            <div className="inline-flex rounded-2xl bg-white px-3.5 py-2.5">
              <BrandLogo size="md" />
            </div>

            <p className="mt-5 max-w-sm text-sm leading-relaxed text-white/60">
              Authentic Korean skincare, curated for Bangladesh.
            </p>

            <div className="mt-6">
              <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-white/50">
                Follow us
              </p>
              <ul className="mt-3 flex items-center gap-3">
                {SOCIAL_LINKS.map((social) => (
                  <li key={social.name}>
                    <a
                      href={social.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={`${SITE_NAME} on ${social.name}`}
                      className="inline-flex h-11 w-11 items-center justify-center rounded-full text-white/50 transition-colors hover:bg-white/10 hover:text-white"
                    >
                      <SocialIcon name={social.icon} className="h-5 w-5" />
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Link columns */}
          <nav
            aria-label="Footer"
            className="grid grid-cols-2 gap-8 lg:col-span-8 xl:grid-cols-4"
          >
            {Object.values(footerLinks).map((section) => (
              <div key={section.title}>
                <h4 className="mb-4 text-sm font-semibold text-white/90">
                  {section.title}
                </h4>
                <ul className="space-y-1">
                  {section.links.map((link) => (
                    <li key={link.label}>
                      <Link
                        href={link.href}
                        className="inline-flex min-h-9 items-center text-sm text-white/60 transition-colors hover:text-white"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
                {section.note ? (
                  <p className="mt-3 max-w-[15rem] text-xs leading-relaxed text-white/50">
                    {section.note}
                  </p>
                ) : null}
              </div>
            ))}
          </nav>
        </div>

        <div className="mt-12 flex flex-col gap-5 border-t border-white/10 pt-6 text-xs text-white/50 sm:flex-row sm:items-center sm:justify-between">
          <p>
            &copy; 2026 {SITE_NAME}. All rights reserved.
          </p>
          <ul className="flex flex-wrap items-center gap-x-5 gap-y-2">
            {TRUST_POINTS.map(({ icon: Icon, label }) => (
              <li key={label} className="inline-flex items-center gap-2">
                <Icon className="h-4 w-4 text-white/35" aria-hidden="true" />
                {label}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </footer>
  );
}

