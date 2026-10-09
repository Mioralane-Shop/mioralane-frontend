import Link from "next/link";
import { isRenderableImageSrc } from "@/lib/safe-image-src";
import type { Brand } from "@/types/brand";

/**
 * One brand tile: the logo when there is one, and the name only when there is
 * not.
 *
 * Logo and name are alternatives, not companions. Printing both reads as a
 * duplicate — "Anua" under an Anua mark — on a surface whose whole job is to
 * show the artwork.
 *
 * The name is still rendered as the fallback rather than dropped, because only
 * six of the 33 brands have a logo: a tile that rendered nothing for the other
 * 27 would leave two-thirds of the grid blank. A text tile and a logo tile are
 * the same height and the same shape, so the grid keeps its rhythm either way.
 *
 * `alt` carries the name for that reason. It used to be `alt=""`, on the
 * reasoning that the visible name beside it made the image decorative — with the
 * name gone, an empty alt would leave a logo-only tile's link with no accessible
 * name at all. `logoAlt` is the stored override, exactly as in the marquee.
 */
export function BrandCard({ brand }: { brand: Brand }) {
  const logoSrc = isRenderableImageSrc(brand.logoUrl) ? brand.logoUrl.trim() : null;

  return (
    <Link
      href={`/shop?brand=${encodeURIComponent(brand.name)}`}
      className="group flex h-32 flex-col items-center justify-center gap-3 rounded-2xl border border-border-light bg-white px-4 text-center transition-colors hover:border-accent/40 hover:bg-ink/[0.02]"
    >
      {logoSrc ? (
        // eslint-disable-next-line @next/next/no-img-element -- these are SVGs, which next/image serves unoptimised anyway, and the API stores no dimensions for them
        <img
          src={logoSrc}
          alt={brand.logoAlt ?? brand.name}
          className="max-h-10 w-auto max-w-[80%] object-contain"
        />
      ) : (
        <span className="text-sm font-medium text-ink/80 group-hover:text-accent">
          {brand.name}
        </span>
      )}
    </Link>
  );
}
