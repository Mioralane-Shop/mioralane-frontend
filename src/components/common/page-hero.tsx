import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * The storefront's section hero — one shared design for every main-menu page.
 *
 * Extracted from the `/shop` banner so Brands, Blog and any future page (Sales)
 * cannot drift from it: the watermark opacity, heading colour, subtitle contrast,
 * corner radius, padding and stacking order live here once.
 *
 * Layering is explicit: the gradient and watermark are `z-0`, the text block is
 * `z-10`. The watermark is `aria-hidden` and `pointer-events-none`, so it is a
 * texture for sighted users and invisible to assistive tech.
 */
export interface PageHeroProps {
  /** Large, faint background word, e.g. `SHOP`, `BRANDS`, `BLOG`. */
  watermarkText: string;
  /** The page's `<h1>`. */
  headingText: ReactNode;
  /** Supporting line under the heading. Omitted when empty. */
  subtitleText?: ReactNode;
  /** Extra classes for the outer container, e.g. spacing overrides. */
  className?: string;
}

export function PageHero({ watermarkText, headingText, subtitleText, className }: PageHeroProps) {
  return (
    <div
      className={cn(
        // Fixed-height band: `min-h` + flex centring means a one-line and a
        // two-line subtitle produce the SAME 250px box on every page.
        "relative mb-8 flex min-h-[250px] flex-col items-center justify-center overflow-hidden rounded-3xl bg-surface px-4 py-10 text-center",
        className
      )}
    >
      <div className="absolute inset-0 z-0 bg-gradient-to-br from-surface to-surface-warm" />
      <div className="pointer-events-none absolute inset-0 z-0 flex items-center justify-center">
        <span
          aria-hidden="true"
          className="font-display text-7xl font-light uppercase tracking-widest text-ink/[0.025] sm:text-9xl md:text-[180px]"
        >
          {watermarkText}
        </span>
      </div>
      <div className="relative z-10 w-full max-w-3xl">
        <h1 className="font-display text-[26px] font-medium leading-tight text-[#111111] [text-shadow:0_1px_2px_rgba(0,0,0,0.06)] md:text-[31px]">
          {headingText}
        </h1>
        {subtitleText ? <p className="mt-3 text-base text-[#555555]">{subtitleText}</p> : null}
      </div>
    </div>
  );
}
