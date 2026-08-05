"use client";

import { useRef } from "react";
import { useCartStore } from "@/store/cart.store";
import { formatPrice } from "@/lib/utils";
import type { Product } from "@/types/product";

const BUNDLES = [
  {
    id: "combo-glass-skin",
    name: "The Glass Skin Routine",
    badge: "✦ RITUAL SET",
    badgeColor: "#D4637A",
    desc: "Cleanser + Toner + Serum + Moisturizer + Sunscreen — the complete Korean routine for Bangladesh.",
    current: 4250,
    original: 5100,
    save: "Save 15%",
    gradient: "linear-gradient(135deg,#FBDDE2,#F2D4DA)",
    img: "/images/promo-routine.jpg",
  },
  {
    id: "combo-acne-set",
    name: "Acne Fighter Bundle",
    badge: "🌿 ACNE FIGHTER",
    badgeColor: "#2D5A3D",
    desc: "COSRX Cleanser + Snail Mucin + BOJ Glow Serum — target breakouts with this powerful 3-step set.",
    current: 3200,
    original: 4000,
    save: "Save 20%",
    gradient: "linear-gradient(135deg,#D8E8D4,#C2D8BE)",
    img: "/images/cosrx-snail.jpg",
  },
  {
    id: "combo-travel-kit",
    name: "Travel Essentials Kit",
    badge: "🧳 TRAVEL",
    badgeColor: "#8B7355",
    desc: "Mini versions of our bestsellers — perfect for trying before you commit or taking on the go.",
    current: 1850,
    original: 2200,
    save: "Save 16%",
    gradient: "linear-gradient(135deg,#F0E8DC,#E4D8C8)",
    img: "/images/promo-minis.jpg",
  },
  {
    id: "combo-uv-shield",
    name: "UV Shield Combo",
    badge: "☀️ SUN PROTECTION",
    badgeColor: "#3D5A80",
    desc: "Beauty of Joseon Sunscreen + COSRX Snail Mucin — protect and repair in one bundle.",
    current: 2800,
    original: 3400,
    save: "Save 18%",
    gradient: "linear-gradient(135deg,#DCE8F5,#C8D8EC)",
    img: "/images/beauty-of-joseon-sun.jpg",
  },
];

export function BundlesCarousel() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const addItem = useCartStore((s) => s.addItem);

  const scroll = (dir: number) => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: dir * 380, behavior: "smooth" });
    }
  };

  const handleAdd = (bundle: (typeof BUNDLES)[number]) => {
    // Create a minimal Product-like object for the cart
    const bundleProduct: Product = {
      id: bundle.id,
      slug: bundle.id,
      name: bundle.name,
      description: bundle.desc,
      price: bundle.current,
      images: [bundle.img],
      category: "combo",
      brand: "Mioralane",
      tags: ["combo", "bundle"],
      rating: 4.8,
      reviewCount: 120,
      stock: 50,
      isNew: false,
      isBestSeller: false,
      createdAt: new Date().toISOString(),
    };
    addItem(bundleProduct, 1);
  };

  return (
    <section className="py-16 md:py-20">
      <div className="container mx-auto px-4">
        <div className="mb-10 text-center">
          <span className="text-sm font-semibold tracking-wider text-brand">
            Limited Bundles
          </span>
          <h2 className="mt-2 text-3xl font-light tracking-tight text-ink">
            Bundles that actually save you money
          </h2>
          <p className="mt-2 text-neutral-500">
            We bundled these because buying them together makes more sense than
            separately.
          </p>
        </div>

        <div className="relative">
          <button
            onClick={() => scroll(-1)}
            className="absolute -left-5 top-1/2 z-10 hidden h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-neutral-200 bg-white shadow-md transition hover:shadow-lg md:flex"
            aria-label="Previous bundle"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
            >
              <path d="m15 18-6-6 6-6" />
            </svg>
          </button>

          <div
            ref={scrollRef}
            className="scrollbar-none flex gap-5 overflow-x-auto pb-4 snap-x snap-mandatory"
          >
            {BUNDLES.map((bundle) => (
              <div
                key={bundle.id}
                className="flex min-w-[320px] snap-start flex-col justify-between overflow-hidden rounded-2xl p-6 md:min-w-[360px]"
                style={{ background: bundle.gradient }}
              >
                <div>
                  <span
                    className="inline-block rounded-full px-3 py-1 text-xs font-semibold"
                    style={{
                      background: "rgba(255,255,255,0.75)",
                      color: bundle.badgeColor,
                    }}
                  >
                    {bundle.badge}
                  </span>
                  <h3 className="mt-3 text-xl font-semibold text-ink">
                    {bundle.name}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-ink/60">
                    {bundle.desc}
                  </p>
                </div>

                <div className="mt-4 flex items-center gap-3">
                  <div className="flex items-center gap-2">
                    <span className="text-xl font-bold text-ink">
                      {formatPrice(bundle.current)}
                    </span>
                    <span className="text-sm text-ink/40 line-through">
                      {formatPrice(bundle.original)}
                    </span>
                    <span className="rounded-full bg-brand/10 px-2 py-0.5 text-xs font-medium text-brand">
                      {bundle.save}
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => handleAdd(bundle)}
                  className="mt-4 w-full rounded-full py-2.5 text-sm font-medium text-white transition hover:opacity-90"
                  style={{ background: bundle.badgeColor }}
                >
                  Add Bundle →
                </button>
              </div>
            ))}
          </div>

          <button
            onClick={() => scroll(1)}
            className="absolute -right-5 top-1/2 z-10 hidden h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-neutral-200 bg-white shadow-md transition hover:shadow-lg md:flex"
            aria-label="Next bundle"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
            >
              <path d="m9 18 6-6-6-6" />
            </svg>
          </button>
        </div>
      </div>
    </section>
  );
}
