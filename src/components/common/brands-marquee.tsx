"use client";

import Image from "next/image";
import Link from "next/link";

const MARQUEE_BRANDS = [
  {
    name: "COSRX",
    src: "/brands/COSRX.svg",
    width: 920,
    height: 206,
  },
  {
    name: "Beauty of Joseon",
    src: "/brands/Beauty-of-Joseon.svg",
    width: 352,
    height: 23,
  },
  {
    name: "ANUA",
    src: "/brands/anua.svg",
    width: 1790,
    height: 466,
  },
  {
    name: "Purito",
    src: "/brands/Purito.svg",
    width: 206,
    height: 60,
  },
  {
    name: "SKIN1004",
    src: "/brands/skin1004.svg",
    width: 1000,
    height: 82,
  },
  {
    name: "AXIS-Y",
    src: "/brands/AXIS-Y.svg",
    width: 361,
    height: 48,
  },
];

export function BrandsMarquee() {
  // Repeat the brand set enough times so the loop reset stays off-screen.
  const items = [
    ...MARQUEE_BRANDS,
    ...MARQUEE_BRANDS,
    ...MARQUEE_BRANDS,
    ...MARQUEE_BRANDS,
  ];

  return (
    <div className="relative overflow-hidden border-y border-ink/5 bg-white py-9">
      {/* Soft edge fades */}
      <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-24 bg-gradient-to-r from-white to-transparent" />
      <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-24 bg-gradient-to-l from-white to-transparent" />

      {/* Marquee track */}
      <div className="flex w-max animate-marquee items-center gap-14 will-change-transform hover:[animation-play-state:paused]">
        {items.map((brand, i) => (
          <Link
            key={`${brand.name}-${i}`}
            href={`/shop?brand=${encodeURIComponent(brand.name)}`}
            className="flex shrink-0 items-center justify-center transition-opacity duration-300 hover:opacity-70"
          >
            <Image
              src={brand.src}
              alt={brand.name}
              width={brand.width}
              height={brand.height}
              className="h-[12px] w-auto object-contain md:h-[16px]"
            />
          </Link>
        ))}
      </div>
    </div>
  );
}
