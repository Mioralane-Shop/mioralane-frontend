"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { BrandsMarquee } from "@/components/common/brands-marquee";

const slides = [
  {
    id: 1,
    badge: "LIMITED TIME OFFER",
    title: "Glow More,\nPay Less",
    discountLabel: "UP TO",
    discountNum: "35%",
    discountSuffix: "OFF",
    subtitle: "On Best-Selling Korean Skincare",
    cta: "Shop Now →",
    href: "/shop",
    bgClass: "from-[#FBDDE2] to-[#F5B8C4]",
    badgeClass: "bg-white/70 text-[#B84E64]",
    titleClass: "text-[#2D2A26]",
    discountNumClass: "text-accent",
    subtitleClass: "text-[#5A5550]",
    btnClass: "bg-[#2D2A26] text-white hover:bg-accent-dark",
    products: [
      {
        src: "/images/anua-oil.jpg",
        alt: "ANUA",
        style: "w-[130px] h-[155px] right-[38%] top-[12%] -rotate-[4deg]",
      },
      {
        src: "/images/purito-bamboo.jpg",
        alt: "Purito",
        style: "w-[115px] h-[135px] right-[16%] top-[20%] rotate-[3deg]",
      },
      {
        src: "/images/beauty-of-joseon-sun.jpg",
        alt: "BOJ",
        style: "w-[125px] h-[145px] right-[2%] top-[10%] -rotate-[2deg]",
      },
    ],
  },
  {
    id: 2,
    badge: "✨ GLASS SKIN",
    title: "Dewy Skin\nBegins Here",
    discountLabel: "",
    discountNum: "4-Step",
    discountSuffix: "Ritual",
    subtitle: "The complete Korean glass skin routine",
    cta: "Shop Routine →",
    href: "/shop?category=combo",
    bgClass: "from-[#1a1a3e] to-[#0d1b3e]",
    badgeClass: "bg-white/12 text-[#F5D76E] border border-white/15",
    titleClass: "text-[#F5D76E]",
    discountNumClass: "text-white",
    subtitleClass: "text-white/60",
    btnClass: "bg-[#F5D76E] text-[#1a1a3e] hover:bg-[#E8C84A]",
    products: [
      {
        src: "/images/cosrx-snail.jpg",
        alt: "COSRX",
        style: "w-[130px] h-[155px] right-[36%] top-[10%] -rotate-[3deg]",
      },
      {
        src: "/images/skin1004-probio.jpg",
        alt: "SKIN1004",
        style: "w-[120px] h-[140px] right-[14%] top-[18%] rotate-[4deg]",
      },
      {
        src: "/images/beauty-of-joseon-glow.jpg",
        alt: "BOJ Glow",
        style: "w-[115px] h-[135px] right-0 top-[12%] -rotate-[1deg]",
      },
    ],
  },
  {
    id: 3,
    badge: "🚚 FREE SHIPPING",
    title: "Free Delivery\nAcross BD",
    discountLabel: "",
    discountNum: "৳0",
    discountSuffix: "Delivery Fee",
    subtitle: "On all orders over ৳999 — use code APP1ST",
    cta: "Shop Now →",
    href: "/shop",
    bgClass: "from-[#f8f9fa] to-[#e9ecef]",
    badgeClass: "bg-[#0050B4]/10 text-[#0050B4] border border-[#0050B4]/15",
    titleClass: "text-[#0050B4]",
    discountNumClass: "text-[#0050B4]",
    subtitleClass: "text-[#5A5550]",
    btnClass: "bg-[#0050B4] text-white hover:bg-[#003D8A]",
    products: [
      {
        src: "/images/hero-product.jpg",
        alt: "Products",
        style: "w-[140px] h-[160px] right-[34%] top-[14%] -rotate-[2deg]",
      },
      {
        src: "/images/cosrx-low-ph.jpg",
        alt: "Cleanser",
        style: "w-[110px] h-[130px] right-[12%] top-[22%] rotate-[3deg]",
      },
      {
        src: "/images/skin1004-mini.jpg",
        alt: "Minis",
        style: "w-[120px] h-[140px] right-0 top-[8%] -rotate-[1deg]",
      },
    ],
  },
  {
    id: 4,
    badge: "🆕 SEOUL DIRECT",
    title: "Fresh From\nSeoul",
    discountLabel: "",
    discountNum: "New",
    discountSuffix: "Arrivals",
    subtitle: "The latest K-beauty drops, just landed in Dhaka",
    cta: "Explore Now →",
    href: "/shop?sort=newest",
    bgClass: "from-[#F5EDE8] to-[#E8D5CC]",
    badgeClass: "bg-white/70 text-[#8B7355]",
    titleClass: "text-[#2D2A26]",
    discountNumClass: "text-accent",
    subtitleClass: "text-[#5A5550]",
    btnClass: "bg-[#2D2A26] text-white hover:bg-accent-dark",
    products: [
      {
        src: "/images/promo-arrivals.jpg",
        alt: "New",
        style: "w-[125px] h-[150px] right-[38%] top-[12%] -rotate-[3deg]",
      },
      {
        src: "/images/promo-cashback.jpg",
        alt: "Cashback",
        style: "w-[115px] h-[135px] right-[16%] top-[20%] rotate-[2deg]",
      },
      {
        src: "/images/promo-minis.jpg",
        alt: "Minis",
        style: "w-[120px] h-[140px] right-[2%] top-[8%] -rotate-[1deg]",
      },
    ],
  },
];

export function HeroSection() {
  const [current, setCurrent] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

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
    if (isPaused) return;
    const timer = setInterval(next, 5000);
    return () => clearInterval(timer);
  }, [isPaused, next]);

  return (
    <section
      className="relative w-full"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <div className="mx-auto max-w-[1440px] px-4 py-4">
        {/* Carousel */}
        <div className="relative aspect-[16/5] overflow-hidden rounded-3xl max-md:aspect-[16/9] max-md:rounded-2xl">
          {slides.map((slide, i) => (
            <div
              key={slide.id}
              className={`absolute inset-0 flex items-center bg-gradient-to-br ${slide.bgClass} transition-opacity duration-600 ${
                i === current ? "opacity-100" : "opacity-0 pointer-events-none"
              }`}
            >
              {/* Content */}
              <div className="flex-[0_0_45%] z-10 pr-5 max-md:flex-[0_0_55%] max-md:pr-2.5">
                <span
                  className={`inline-block rounded-full px-3.5 py-[5px] text-[10px] font-bold uppercase tracking-[0.1em] backdrop-blur-sm ${slide.badgeClass}`}
                >
                  {slide.badge}
                </span>
                <h2
                  className={`font-serif text-[clamp(26px,4vw,46px)] font-bold leading-[1.1] mb-2 whitespace-pre-line ${slide.titleClass}`}
                >
                  {slide.title}
                </h2>
                <div className="mb-1.5 flex items-baseline gap-2">
                  {slide.discountLabel && (
                    <span
                      className="text-sm font-semibold"
                      style={{ color: "inherit" }}
                    >
                      {slide.discountLabel}
                    </span>
                  )}
                  <span
                    className={`font-serif text-[clamp(36px,5.5vw,64px)] font-bold leading-none ${slide.discountNumClass}`}
                  >
                    {slide.discountNum}
                  </span>
                  <span className="font-serif text-[22px] font-bold text-accent">
                    {slide.discountSuffix}
                  </span>
                </div>
                <p
                  className={`mb-4 text-[13px] font-normal ${slide.subtitleClass}`}
                >
                  {slide.subtitle}
                </p>
                <Link
                  href={slide.href}
                  className={`inline-flex items-center gap-2 rounded-full px-6 py-3 text-[13px] font-semibold transition-all hover:-translate-y-px ${slide.btnClass}`}
                >
                  {slide.cta}
                </Link>
              </div>

              {/* Product images */}
              <div className="relative flex-1 h-full z-[1]">
                {slide.products.map((product, pi) => (
                  <div
                    key={pi}
                    className={`absolute overflow-hidden rounded-xl border-2 border-white/50 shadow-lg ${product.style}`}
                  >
                    <Image
                      src={product.src}
                      alt={product.alt}
                      width={160}
                      height={190}
                      className="h-full w-full object-cover"
                    />
                  </div>
                ))}
              </div>
            </div>
          ))}

          {/* Dots */}
          <div className="absolute bottom-4 left-1/2 z-20 flex -translate-x-1/2 gap-2">
            {slides.map((_, i) => (
              <button
                key={i}
                onClick={() => goTo(i)}
                className={`h-2.5 rounded-full transition-all duration-300 ${
                  i === current ? "w-7 bg-white" : "w-2.5 bg-white/40"
                }`}
              />
            ))}
          </div>

          {/* Arrows */}
          <button
            onClick={prev}
            className="absolute left-4 top-1/2 z-20 flex h-[42px] w-[42px] -translate-y-1/2 items-center justify-center rounded-full bg-white/85 text-[#2D2A26] backdrop-blur-sm border border-white/90 transition-all hover:scale-105 max-md:hidden"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            onClick={next}
            className="absolute right-4 top-1/2 z-20 flex h-[42px] w-[42px] -translate-y-1/2 items-center justify-center rounded-full bg-white/85 text-[#2D2A26] backdrop-blur-sm border border-white/90 transition-all hover:scale-105 max-md:hidden"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>

        {/* Brands marquee — premium auto-rotating logo strip */}
        <BrandsMarquee />
      </div>
    </section>
  );
}
