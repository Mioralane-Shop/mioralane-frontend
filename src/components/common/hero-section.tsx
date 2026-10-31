"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { BrandsMarquee } from "@/components/common/brands-marquee";
import { safeHref } from "@/lib/safe-href";
import { isRenderableImageSrc } from "@/lib/safe-image-src";
import { useHeroSlides } from "@/hooks/use-hero-slides";

type HeroSlideView = {
  id: string;
  imageUrl: string;
  targetUrl: string;
  altText?: string;
};

/**
 * Shown while the request is in flight and whenever it fails or returns nothing,
 * so the top of the homepage is never blank or collapsed.
 */
const FALLBACK_SLIDES: HeroSlideView[] = [
  {
    id: "fallback-1",
    imageUrl: "/slider/slider1.png",
    altText: "Mioralane skincare banner",
    targetUrl: "/shop",
  },
  {
    id: "fallback-2",
    imageUrl: "/slider/slider2.png",
    altText: "Mioralane Korean skincare banner",
    targetUrl: "/shop",
  },
];

const IMAGEKIT_HOST = "ik.imagekit.io";

/**
 * Appends an ImageKit transformation to an ImageKit URL.
 *
 * `w-1600` matches the widest the banner is ever painted (the container is capped
 * at 1440px plus padding), `q-85` is visually lossless for photography, and
 * `f-auto` lets ImageKit serve AVIF/WebP where the browser accepts it — so the
 * 2103px original is not shipped to a phone.
 *
 * A URL that already carries a `tr=` is left alone: the admin may have chosen
 * their own crop, and overriding it would silently change their artwork.
 */
function posterSrc(imageUrl: string): string {
  if (!imageUrl.includes(IMAGEKIT_HOST) || /[?&]tr=/.test(imageUrl)) {
    return imageUrl;
  }

  return `${imageUrl}${imageUrl.includes("?") ? "&" : "?"}tr=w-1600,q-85,f-auto`;
}

/** An absolute link leaves the site, so it opens in a new tab with `noopener`. */
function isExternalHref(targetUrl: string): boolean {
  return targetUrl.startsWith("http://") || targetUrl.startsWith("https://");
}

/**
 * The poster itself.
 *
 * A plain `<img>` rather than `next/image`: the URL is pasted by an admin and can
 * point at any host, while `next/image` refuses anything missing from
 * `images.remotePatterns`. `object-cover` keeps the pre-designed artwork filling
 * the fixed-ratio frame at every width.
 */
function SlidePoster({ slide, priority }: { slide: HeroSlideView; priority: boolean }) {
  // `imageUrl` is stored data, so it is rendered only if the shared guard accepts
  // it — the same rule every other stored image follows (`lib/safe-image-src.ts`).
  // An unusable value leaves the frame as a plain panel instead of a broken image.
  if (!isRenderableImageSrc(slide.imageUrl)) {
    return <div className="h-full w-full bg-[#FAF9F7]" aria-hidden="true" />;
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={posterSrc(slide.imageUrl)}
      alt={slide.altText?.trim() || "Mioralane promotion"}
      className="h-full w-full object-cover"
      loading={priority ? "eager" : "lazy"}
      fetchPriority={priority ? "high" : "auto"}
    />
  );
}

export function HeroSection() {
  const { slides: fetchedSlides, isLoading } = useHeroSlides();
  const [current, setCurrent] = useState(0);
  const [paused, setPaused] = useState(false);

  const slides: HeroSlideView[] =
    !isLoading && fetchedSlides.length > 0
      ? fetchedSlides.map((slide) => ({
          id: slide.id,
          imageUrl: slide.imageUrl,
          targetUrl: slide.targetUrl,
          altText: slide.altText,
        }))
      : FALLBACK_SLIDES;

  // A shorter list (or a different first slide) can leave the index past the end
  // after a refetch, which would render an empty frame. Clamped during render
  // rather than in an effect, so nothing is written back just to fix a read.
  const activeIndex = current < slides.length ? current : 0;

  const goTo = useCallback((index: number) => {
    setCurrent(index);
  }, []);

  const next = useCallback(() => {
    setCurrent((prev) => (prev + 1) % slides.length);
  }, [slides.length]);

  const prev = useCallback(() => {
    setCurrent((prev) => (prev - 1 + slides.length) % slides.length);
  }, [slides.length]);

  useEffect(() => {
    if (paused || slides.length <= 1) return;
    if (
      typeof window !== "undefined" &&
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches
    ) {
      return;
    }

    const timer = setInterval(next, 5000);
    return () => clearInterval(timer);
  }, [next, paused, slides.length]);

  return (
    <section
      className="relative w-full"
      aria-roledescription="carousel"
      aria-label="Featured promotions"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
    >
      <div className="mx-auto max-w-[1440px] px-4 py-4">
        <div className="relative aspect-[2103/748] overflow-hidden rounded-3xl max-md:rounded-2xl">
          {slides.map((slide, i) => {
            const label = `${slide.altText?.trim() || "Promotion"} — shop now`;
            // Stored destination, so it goes through the href guard: an unsafe or
            // missing value sends the visitor to the shop instead of becoming an
            // anchor that a `javascript:` string could occupy.
            const targetHref = safeHref(slide.targetUrl) ?? "/shop";
            const linkClass =
              "absolute inset-0 block focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-accent";

            return (
              <div
                key={slide.id}
                className={`absolute inset-0 transition-opacity duration-700 ${i === activeIndex ? "opacity-100" : "pointer-events-none opacity-0"
                  }`}
                aria-hidden={i === activeIndex ? undefined : true}
                inert={i === activeIndex ? undefined : true}
              >
                {/*
                  No CTA overlay: each poster is finished artwork carrying its own
                  headline and button, so the whole banner is the link. Absolute
                  targets open in a new tab; site paths stay client-side.
                */}
                {isExternalHref(targetHref) ? (
                  <a
                    href={targetHref}
                    className={linkClass}
                    aria-label={label}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <SlidePoster slide={slide} priority={i === 0} />
                  </a>
                ) : (
                  <Link href={targetHref} className={linkClass} aria-label={label}>
                    <SlidePoster slide={slide} priority={i === 0} />
                  </Link>
                )}
              </div>
            );
          })}

          {slides.length > 1 ? (
            <>
              <div className="absolute bottom-1 left-1/2 z-20 flex -translate-x-1/2 items-center gap-0.5 sm:bottom-2 sm:gap-1">
                {slides.map((slide, i) => (
                  <button
                    key={`dot-${slide.id}`}
                    onClick={() => goTo(i)}
                    className="flex h-11 w-7 items-center justify-center px-0.5"
                    aria-label={`Go to banner ${i + 1}`}
                    aria-current={i === activeIndex ? "true" : undefined}
                  >
                    <span
                      className={`block h-2.5 rounded-full bg-white transition-all duration-300 ${i === activeIndex ? "w-7 opacity-95" : "w-2.5 opacity-50"
                        }`}
                    />
                  </button>
                ))}
              </div>

              <button
                onClick={prev}
                className="absolute left-4 top-1/2 z-20 hidden h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-white/90 bg-white/85 text-[#2D2A26] backdrop-blur-xs transition-all hover:bg-white md:flex"
                aria-label="Previous banner"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                onClick={next}
                className="absolute right-4 top-1/2 z-20 hidden h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-white/90 bg-white/85 text-[#2D2A26] backdrop-blur-xs transition-all hover:bg-white md:flex"
                aria-label="Next banner"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </>
          ) : null}
        </div>

        <BrandsMarquee />
      </div>
    </section>
  );
}
