import Link from "next/link";
import { SITE_NAME } from "@/constants/site";

const footerLinks = {
  shop: {
    title: "Shop",
    links: [
      { label: "All Products", href: "/shop" },
      { label: "Cleansers", href: "/shop?category=cleansers" },
      { label: "Toners & Essences", href: "/shop?category=serums" },
      { label: "Serums & Ampoules", href: "/shop?category=serums" },
      { label: "Sunscreen", href: "/shop?category=sun-care" },
      { label: "Bundles", href: "/combo" },
    ],
  },
  company: {
    title: "Company",
    links: [
      { label: "About Us", href: "/about" },
      { label: "Blog", href: "/blog" },
      { label: "Contact", href: "/contact" },
      { label: "Authenticity Policy", href: "/authenticity" },
    ],
  },
  help: {
    title: "Help",
    links: [
      { label: "Delivery Policy", href: "/delivery" },
      { label: "Return & Refund", href: "/returns" },
      { label: "Track Order", href: "/track-order" },
      { label: "FAQ", href: "/faq" },
    ],
  },
};

export function Footer() {
  return (
    <footer className="bg-ink text-white/55 py-16 px-6">
      <div className="mx-auto max-w-[1200px]">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">
          <div>
            <div className="font-serif italic text-2xl font-medium text-white mb-4">
              {SITE_NAME.slice(0, 3)}
              <span className="text-accent font-normal">
                {SITE_NAME.slice(3)}
              </span>
            </div>
            <p className="text-sm leading-relaxed font-light max-w-[300px]">
              Authentic Korean skincare, sourced with care, delivered with
              trust. Building Bangladesh&apos;s most trusted destination for
              K-beauty.
            </p>
          </div>

          {Object.values(footerLinks).map((section) => (
            <div key={section.title}>
              <h4 className="text-xs font-semibold uppercase tracking-widest text-white/30 mb-5">
                {section.title}
              </h4>
              <ul className="space-y-3">
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

        <div className="border-t border-white/7 pt-6 flex flex-wrap justify-between items-center gap-3">
          <p className="text-xs text-white/25">
            &copy; {new Date().getFullYear()} {SITE_NAME}. All rights reserved.
          </p>
          <div className="flex gap-2.5">
            {["bKash", "Nagad", "Rocket", "COD"].map((method) => (
              <span
                key={method}
                className="px-3 py-1.5 rounded-md bg-white/6 text-[11px] font-semibold text-white/40"
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
