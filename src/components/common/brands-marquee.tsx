"use client";

import Link from "next/link";

// Premium auto-rotating brand wordmark marquee.
// Replace these text wordmarks with official logo images once available.
const MARQUEE_BRANDS = [
  "COSRX",
  "Beauty of Joseon",
  "ANUA",
  "Purito",
  "SKIN1004",
  "Torriden",
  "Medicube",
  "Celimax",
  "ARENCIA",
  "Round Lab",
  "Numbuzin",
  "Illiyoon",
  "Some By Mi",
  "I'm From",
  "AXIS-Y",
  "Benton",
  "Mediheal",
  "Dr. G",
];

export function BrandsMarquee() {
  // Duplicate the list once so the translate(-50%) loop is seamless.
  const items = [...MARQUEE_BRANDS, ...MARQUEE_BRANDS];

  return (
    <div className="relative overflow-hidden border-y border-ink/5 bg-white py-9">
      {/* Soft edge fades */}
      <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-24 bg-gradient-to-r from-white to-transparent" />
      <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-24 bg-gradient-to-l from-white to-transparent" />

      {/* Marquee track */}
      <div className="flex w-max animate-marquee items-center gap-14 hover:[animation-play-state:paused]">
        {items.map((brand, i) => (
          <Link
            key={`${brand}-${i}`}
            href={`/shop?brand=${encodeURIComponent(brand)}`}
            className="whitespace-nowrap font-serif text-2xl font-medium tracking-tight text-ink/25 transition-colors duration-300 hover:text-accent md:text-3xl"
          >
            {brand}
          </Link>
        ))}
      </div>
    </div>
  );
}
