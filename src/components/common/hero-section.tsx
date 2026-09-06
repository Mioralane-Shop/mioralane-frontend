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
    const timer = setInterval(next, 5000);
    return () => clearInterval(timer);
  }, [next]);

  return (
    <section className="relative w-full">
      <div className="mx-auto max-w-[1440px] px-4 py-4">
        <div className="relative aspect-[2103/748] overflow-hidden rounded-3xl max-md:rounded-2xl">
          {slides.map((slide, i) => (
            <div
              key={slide.id}
              className={`absolute inset-0 transition-opacity duration-700 ${
                i === current ? "opacity-100" : "pointer-events-none opacity-0"
              }`}
            >
              <Image
                src={slide.image}
                alt={slide.alt}
                fill
                priority={i === 0}
                className="object-cover"
                sizes="(max-width: 1440px) calc(100vw - 32px), 1408px"
              />

              <Link
                href={slide.href}
                className="hero-cta-glow absolute bottom-[18%] left-[8%] z-40 inline-flex h-9 items-center justify-center rounded-full bg-accent px-5 text-xs font-semibold text-white no-underline shadow-[0_12px_28px_rgba(212,99,122,0.24)] transition-[transform,background-color] duration-200 hover:scale-[1.02] hover:bg-accent-dark sm:h-10 sm:px-6 sm:text-sm md:h-11 md:px-7"
              >
                Shop Now
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </div>
          ))}

          <div className="absolute bottom-3 left-1/2 z-20 flex -translate-x-1/2 gap-2 sm:bottom-4">
            {slides.map((_, i) => (
              <button
                key={i}
                onClick={() => goTo(i)}
                className={`h-2.5 rounded-full bg-white transition-all duration-300 ${
                  i === current ? "w-7 opacity-95" : "w-2.5 opacity-50"
                }`}
                aria-label={`Go to banner ${i + 1}`}
              />
            ))}
          </div>

          <button
            onClick={prev}
            className="absolute left-4 top-1/2 z-20 hidden h-[42px] w-[42px] -translate-y-1/2 items-center justify-center rounded-full border border-white/90 bg-white/85 text-[#2D2A26] backdrop-blur-sm transition-all hover:bg-white md:flex"
            aria-label="Previous banner"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            onClick={next}
            className="absolute right-4 top-1/2 z-20 hidden h-[42px] w-[42px] -translate-y-1/2 items-center justify-center rounded-full border border-white/90 bg-white/85 text-[#2D2A26] backdrop-blur-sm transition-all hover:bg-white md:flex"
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
