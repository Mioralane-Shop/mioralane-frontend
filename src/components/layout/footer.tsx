import Link from "next/link";
import { SITE_NAME } from "@/constants/site";
import { Camera, MessageCircle, AtSign } from "lucide-react";

const footerLinks = {
  shop: {
    title: "Shop",
    links: [
      { label: "All Products", href: "/shop" },
      { label: "Best Sellers", href: "/shop?sort=best-seller" },
      { label: "New Arrivals", href: "/shop?sort=newest" },
      { label: "Gift Sets", href: "/shop?category=sets" },
    ],
  },
  help: {
    title: "Help",
    links: [
      { label: "Contact Us", href: "#" },
      { label: "FAQs", href: "#" },
      { label: "Shipping & Returns", href: "#" },
      { label: "Track Order", href: "#" },
    ],
  },
  company: {
    title: "Company",
    links: [
      { label: "About Us", href: "#" },
      { label: "Our Story", href: "#" },
      { label: "Sustainability", href: "#" },
      { label: "Careers", href: "#" },
    ],
  },
};

export function Footer() {
  return (
    <footer className="border-t border-rose-100 bg-white">
      <div className="container mx-auto px-4 py-12">
        <div className="grid gap-8 md:grid-cols-4">
          <div>
            <Link
              href="/"
              className="text-xl font-light tracking-wide text-rose-600"
            >
              {SITE_NAME}
            </Link>
            <p className="mt-3 text-sm text-neutral-500 leading-relaxed">
              Premium Korean skincare crafted with nature&apos;s finest
              ingredients for your most radiant, healthy skin.
            </p>
            <div className="mt-4 flex gap-3">
              <a
                href="#"
                className="rounded-full p-2 text-neutral-400 transition-colors hover:bg-rose-50 hover:text-rose-500"
                aria-label="Instagram"
              >
                <Camera className="h-4 w-4" />
              </a>
              <a
                href="#"
                className="rounded-full p-2 text-neutral-400 transition-colors hover:bg-rose-50 hover:text-rose-500"
                aria-label="Facebook"
              >
                <MessageCircle className="h-4 w-4" />
              </a>
              <a
                href="#"
                className="rounded-full p-2 text-neutral-400 transition-colors hover:bg-rose-50 hover:text-rose-500"
                aria-label="Twitter"
              >
                <AtSign className="h-4 w-4" />
              </a>
            </div>
          </div>

          {Object.values(footerLinks).map((section) => (
            <div key={section.title}>
              <h4 className="mb-4 text-sm font-semibold uppercase tracking-wider text-neutral-800">
                {section.title}
              </h4>
              <ul className="space-y-2">
                {section.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-sm text-neutral-500 transition-colors hover:text-rose-500"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-10 border-t border-rose-50 pt-6 text-center text-xs text-neutral-400">
          &copy; {new Date().getFullYear()} {SITE_NAME}. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
