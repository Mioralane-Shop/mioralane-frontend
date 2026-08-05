"use client";

import { useRef } from "react";
import Image from "next/image";
import Link from "next/link";

const PROMOS = [
  {
    badge: "✦ REGIMEN",
    title: "4-Step Glass Skin\nRoutine",
    desc: "Cleanse • Tone • Treat • Seal",
    cta: "Shop Routine →",
    href: "/shop",
    bg: "#D8E2DC",
    img: "/images/promo-routine.jpg",
  },
  {
    badge: "⚡ MOBILE BANKING",
    title: "10% Cashback",
    desc: "On bKash & Nagad payments",
    cta: "Shop & Save →",
    href: "/shop",
    bg: "#FFE5EC",
    img: "/images/promo-cashback.jpg",
  },
  {
    badge: "🧭 SEOUL DIRECT",
    title: "New Arrivals",
    desc: "Fresh from Seoul this week",
    cta: "Explore Now →",
    href: "/shop",
    bg: "#EAEFEA",
    img: "/images/promo-arrivals.jpg",
  },
  {
    badge: "🧳 TRAVEL MINIS",
    title: "Mini Size, Big Glow",
    desc: "Travel-friendly skincare essentials",
    cta: "Shop Minis →",
    href: "/shop?cat=mini",
    bg: "#EAE3DA",
    img: "/images/promo-minis.jpg",
  },
];

export function PromoCarousel() {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (dir: number) => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: dir * 320, behavior: "smooth" });
    }
  };

  return (
    <section className="py-10 md:py-14">
      <div className="container mx-auto px-4">
        <div className="relative">
          {/* Arrows */}
          <button
            onClick={() => scroll(-1)}
            className="absolute -left-4 top-1/2 z-10 hidden h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-neutral-200 bg-white/90 shadow-md backdrop-blur transition hover:bg-white hover:shadow-lg md:flex"
            aria-label="Scroll left"
          >
            <svg
              width="18"
              height="18"
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
            className="scrollbar-none flex gap-4 overflow-x-auto pb-4 snap-x snap-mandatory"
          >
            {PROMOS.map((promo) => (
              <Link
                key={promo.title}
                href={promo.href}
                className="flex min-w-[280px] flex-1 snap-start items-center justify-between rounded-2xl p-6 transition-shadow hover:shadow-lg md:min-w-[300px]"
                style={{ background: promo.bg }}
              >
                <div className="flex flex-col gap-2">
                  <span className="text-[11px] font-semibold tracking-wider text-ink/50">
                    {promo.badge}
                  </span>
                  <h3 className="whitespace-pre-line text-lg font-semibold leading-snug text-ink">
                    {promo.title}
                  </h3>
                  <p className="text-sm text-ink/50">{promo.desc}</p>
                  <span className="mt-1 text-sm font-medium text-brand">
                    {promo.cta}
                  </span>
                </div>
                <div className="relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-xl">
                  <Image
                    src={promo.img}
                    alt={promo.title.replace("\n", " ")}
                    fill
                    className="object-cover"
                    sizes="80px"
                  />
                </div>
              </Link>
            ))}
          </div>

          <button
            onClick={() => scroll(1)}
            className="absolute -right-4 top-1/2 z-10 hidden h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-neutral-200 bg-white/90 shadow-md backdrop-blur transition hover:bg-white hover:shadow-lg md:flex"
            aria-label="Scroll right"
          >
            <svg
              width="18"
              height="18"
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
