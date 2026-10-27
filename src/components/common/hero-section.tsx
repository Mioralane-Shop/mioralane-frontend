"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import { BrandsMarquee } from "@/components/common/brands-marquee";

const slides = [
  {
    id: 1,
    image: "/slider/slider1.png",
    alt: "Mioralane skincare banner",
    href: "/shop",
  },
  {
    id: 2,
    image: "/slider/slider2.png",
    alt: "Mioralane Korean skincare banner",
    href: "/shop",
  },
];

export function HeroSection() {
  const [current, setCurrent] = useState(0);
  const [paused, setPaused] = useState(false);

  const goTo = useCallback((index: number) => {
    setCurrent(index);
  }, []);

  const next = useCallback(() => {
    setCurrent((prev) => (prev + 1) % slides.length);
  }, []);

  const prev = useCallback(() => {
    setCurrent((prev) => (prev - 1 + slides.length) % slides.length);
  }, []);

  useEffect(() => {
    if (paused) return;
    if (
      typeof window !== "undefined" &&
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches
    ) {
      return;
    }

    const timer = setInterval(next, 5000);
    return () => clearInterval(timer);
  }, [next, paused]);

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
          {slides.map((slide, i) => (
            <div
              key={slide.id}
              className={`absolute inset-0 transition-opacity duration-700 ${i === current ? "opacity-100" : "pointer-events-none opacity-0"
                }`}
              aria-hidden={i === current ? undefined : true}
              inert={i === current ? undefined : true}
            >
              <Link
                href={slide.href}
                className="absolute inset-0 block focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-accent"
                aria-label={`${slide.alt} — shop now`}
              >
                <Image
                  src={slide.image}
                  alt={slide.alt}
                  fill
                  priority={i === 0}
                  className="object-cover"
                  sizes="(max-width: 1440px) calc(100vw - 32px), 1408px"
                />
              </Link>

              <Link
                href={slide.href}
                className="hero-cta-glow absolute bottom-[18%] left-[8%] z-40 hidden h-9 items-center justify-center rounded-full bg-accent px-5 text-xs font-semibold text-white no-underline shadow-[0_12px_28px_rgba(251,111,146,0.24)] transition-[transform,background-color] duration-200 hover:scale-[1.02] hover:bg-accent-dark sm:h-10 sm:px-6 sm:text-sm md:inline-flex md:h-11 md:px-7"
              >
                Shop Now
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </div>
          ))}

          <div className="absolute bottom-1 left-1/2 z-20 flex -translate-x-1/2 items-center gap-0.5 sm:bottom-2 sm:gap-1">
            {slides.map((_, i) => (
              <button
                key={i}
                onClick={() => goTo(i)}
                className="flex h-11 w-7 items-center justify-center px-0.5"
                aria-label={`Go to banner ${i + 1}`}
                aria-current={i === current ? "true" : undefined}
              >
                <span
                  className={`block h-2.5 rounded-full bg-white transition-all duration-300 ${i === current ? "w-7 opacity-95" : "w-2.5 opacity-50"
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
        </div>

        <BrandsMarquee />
      </div>
    </section>
  );
}
