import Link from "next/link";
import { isRenderableImageSrc } from "@/lib/safe-image-src";
import type { Brand } from "@/types/brand";

/**
 * One brand tile: the logo when there is one, the name either way.
 *
 * A logo and a name are not alternatives. Only six of the 33 brands have
 * artwork, so a grid that rendered "logo or nothing" would be two-thirds empty
 * boxes — the name is always present, and the logo is added above it when it
 * exists. A text-only tile is therefore the same height and the same shape as
 * one with a mark, which is what keeps the grid from looking broken.
 *
 * `alt=""` on the image is deliberate: the brand name is visible in the same
 * tile, so the image is decorative and announcing "Anua logo" next to "Anua"
 * would make a screen reader repeat itself. `logoAlt` is stored for consumers
 * with no visible name — the marquee uses it.
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
          alt=""
          className="max-h-10 w-auto max-w-[80%] object-contain"
        />
      ) : null}
      <span className="text-sm font-medium text-ink/80 group-hover:text-accent">
        {brand.name}
      </span>
    </Link>
  );
}
