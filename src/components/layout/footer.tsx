import Link from "next/link";
import { BrandLogo } from "@/components/layout/brand-logo";
import { SITE_NAME } from "@/constants/site";

const footerLinks = {
  shop: {
    title: "Shop",
    links: [
      { label: "All Products", href: "/shop" },
      { label: "New Arrivals", href: "/shop?sort=newest" },
      { label: "Bundles", href: "/combo" },
    ],
  },
  company: {
    title: "Company",
    links: [
      { label: "About Us", href: "/about" },
      { label: "Contact", href: "/contact" },
      { label: "Authenticity Policy", href: "/authenticity" },
    ],
  },
  help: {
    title: "Help",
    links: [
      { label: "Support Center", href: "/contact" },
      { label: "Delivery Policy", href: "/delivery" },
      { label: "Return & Refund", href: "/returns" },
      { label: "Track Order", href: "/track-order" },
      { label: "FAQ", href: "/faq" },
    ],
  },
};

export function Footer() {
  return (
    <footer className="bg-ink px-6 py-10 text-white/55 md:py-12">
      <div className="mx-auto max-w-[1200px]">
        <div className="mb-7 grid grid-cols-1 gap-8 md:grid-cols-4 md:gap-10">
          <div>
            <BrandLogo
              size="lg"
              className="mb-3"
            />
            <p className="max-w-[220px] text-sm font-light leading-[1.55]">
              Curated Korean skincare, sourced with care.
            </p>
          </div>

          {Object.values(footerLinks).map((section) => (
            <div key={section.title}>
              <h4 className="mb-3 text-xs font-semibold uppercase tracking-widest text-white/30">
                {section.title}
              </h4>
              <ul className="space-y-2.5">
                {section.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-sm text-white/55 transition-colors hover:text-white"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-white/7 pt-4">
          <p className="text-xs text-white/25">&copy; 2026 {SITE_NAME}</p>
          <div className="flex flex-wrap items-center gap-2">
            {["Cash on Delivery", "Nationwide Delivery", "Authentic Products"].map((method) => (
              <span
                key={method}
                className="rounded-md bg-white/6 px-3 py-1 text-[11px] font-semibold leading-5 text-white/40"
              >
                {method}
              </span>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
