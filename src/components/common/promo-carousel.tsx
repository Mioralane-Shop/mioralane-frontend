"use client";

import Image from "next/image";
import Link from "next/link";

const PROMOS = [
  {
    badge: "NEW THIS WEEK",
    title: "New Arrivals",
    desc: "Fresh Korean skincare drops",
    cta: "Explore New",
    href: "/shop?sort=newest",
    bg: "#D8E2DC",
    img: "/images/promo-arrivals.jpg",
  },
  {
    badge: "CURATED FOR YOU",
    title: "Shop by Routine",
    desc: "Build a routine that fits your skin goals",
    cta: "Explore Routines",
    href: "/combo",
    bg: "#FFE5EC",
    img: "/images/promo-routine.jpg",
  },
  {
    badge: "MOST LOVED",
    title: "Popular Picks",
    desc: "Customer-favorite skincare essentials",
    cta: "Shop Popular",
    href: "/shop?sort=popular",
    bg: "#EAE3DA",
    img: "/images/promo-cashback.jpg",
  },
];

export function PromoCarousel() {
  return (
    <section className="pt-8 pb-16 md:pt-9 md:pb-[72px] lg:pt-10 lg:pb-20">
      <div className="mx-auto max-w-[1440px] px-4">
        <div className="scrollbar-none flex gap-4 overflow-x-auto pb-4 snap-x snap-mandatory [scrollbar-width:none] [&::-webkit-scrollbar]:hidden md:grid md:grid-cols-3 md:overflow-visible">
          {PROMOS.map((promo) => (
            <Link
              key={promo.title}
              href={promo.href}
              className="group flex min-w-[280px] snap-start items-center justify-between rounded-2xl border border-transparent px-5 py-5 shadow-[0_6px_18px_-16px_rgba(17,24,39,0.28)] transition-[transform,box-shadow,border-color] duration-200 hover:-translate-y-0.5 hover:border-black/8 hover:shadow-[0_10px_22px_-18px_rgba(17,24,39,0.22)] md:min-w-0 md:px-7 md:py-5"
              style={{ background: promo.bg }}
            >
              <div className="flex flex-col gap-1.5 pr-4 md:gap-2">
                <span className="text-[11px] font-semibold tracking-wider text-ink/50">
                  {promo.badge}
                </span>
                <h3 className="whitespace-pre-line text-lg font-semibold leading-tight text-ink">
                  {promo.title}
                </h3>
                <p className="text-sm leading-snug text-ink/50">
                  {promo.desc}
                </p>
                <span className="mt-0.5 inline-flex items-center gap-1 text-sm font-semibold text-ink/72">
                  <span>{promo.cta}</span>
                  <span className="transition-transform duration-200 group-hover:translate-x-1">
                    →
                  </span>
                </span>
              </div>
              <div className="relative h-[78px] w-[78px] flex-shrink-0 overflow-hidden rounded-xl md:h-[80px] md:w-[80px]">
                <Image
                  src={promo.img}
                  alt={promo.title.replace("\n", " ")}
                  fill
                  className="object-cover transition-transform duration-200 group-hover:scale-[1.03]"
                  sizes="80px"
                />
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
