"use client";

import Link from "next/link";
import { useMarqueeBrands } from "@/hooks/use-marquee-brands";
import { isRenderableImageSrc } from "@/lib/safe-image-src";

export function BrandsMarquee() {
  const { brands } = useMarqueeBrands();

  // Guard before the DOM: a logo URL that cannot be rendered is dropped, and if
  // none survive, the section renders nothing at all. There is no bundled set of
  // logos to fall back to — a half-empty band is worse than an absent one, and
  // the API already excludes brands without a logo.
  const logos = brands.flatMap((brand) => {
    const src = isRenderableImageSrc(brand.logoUrl) ? brand.logoUrl.trim() : null;

    return src
      ? [{ key: brand.id, src, alt: brand.logoAlt ?? brand.name, name: brand.name }]
      : [];
  });

  if (logos.length === 0) {
    return null;
  }

  /*
   * FOUR copies of the track, and the count is coupled to the animation rather
   * than to taste: `@keyframes marquee` in `globals.css` translates to -25%, so a
   * quarter of the track must be exactly one copy or the loop visibly jumps. It is
   * independent of how many brands are curated — more brands make a longer track,
   * not a different fraction.
   */
  const items = Array.from({ length: 4 }, () => logos).flat();

  return (
    <div className="relative overflow-hidden border-y border-ink/5 bg-white py-9">
      {/* Soft edge fades */}
      <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-24 bg-gradient-to-r from-white to-transparent" />
      <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-24 bg-gradient-to-l from-white to-transparent" />

      {/* Marquee track */}
      <div className="flex w-max animate-marquee items-center gap-14 will-change-transform hover:[animation-play-state:paused]">
        {items.map((item, i) => (
          <Link
            key={`${item.key}-${i}`}
            href={`/shop?brand=${encodeURIComponent(item.name)}`}
            className="flex shrink-0 items-center justify-center transition-opacity duration-300 hover:opacity-70"
          >
            {/* eslint-disable-next-line @next/next/no-img-element -- SVGs, which next/image serves unoptimised anyway, and the API stores no dimensions for them */}
            <img
              src={item.src}
              alt={item.alt}
              className="h-[12px] w-auto object-contain md:h-[16px]"
            />
          </Link>
        ))}
      </div>
    </div>
  );
}
