"use client";

import { useRef } from "react";
import Image from "next/image";
import { Play, ChevronLeft, ChevronRight, ArrowRight } from "lucide-react";
import { SectionHeading } from "@/components/common/section-heading";

const IG_POSTS = [
  {
    id: "1",
    image: "/images/ig-sunscreen.jpg",
    href: "https://www.instagram.com/",
    isVideo: true,
  },
  {
    id: "2",
    image: "/images/ig-serums.jpg",
    href: "https://www.instagram.com/",
    isVideo: false,
  },
  {
    id: "3",
    image: "/images/ig-kbeauty.jpg",
    href: "https://www.instagram.com/",
    isVideo: true,
  },
  {
    id: "4",
    image: "/images/ig-roller.jpg",
    href: "https://www.instagram.com/",
    isVideo: false,
  },
  {
    id: "5",
    image: "/images/ig-flatlay.jpg",
    href: "https://www.instagram.com/",
    isVideo: false,
  },
  {
    id: "6",
    image: "/images/ig-pink.jpg",
    href: "https://www.instagram.com/",
    isVideo: true,
  },
  {
    id: "7",
    image: "/images/catalog-serum.jpg",
    href: "https://www.instagram.com/",
    isVideo: false,
  },
  {
    id: "8",
    image: "/images/catalog-cream.jpg",
    href: "https://www.instagram.com/",
    isVideo: false,
  },
];

export function InstagramSection() {
  const trackRef = useRef<HTMLDivElement>(null);

  const scrollByCards = (dir: number) => {
    const el = trackRef.current;
    if (!el) return;
    const card = el.querySelector<HTMLElement>("[data-card]");
    const amount = card ? card.offsetWidth + 16 : 300;
    el.scrollBy({ left: dir * amount, behavior: "smooth" });
  };

  return (
    <section className="home-section bg-white">
      <div className="container mx-auto px-4">
        <SectionHeading
          title="FOLLOW US ON INSTAGRAM"
          titleClassName="text-[22px] md:text-[25px] lg:text-[29px]"
        />
        <a
          href="https://www.instagram.com/mioralane/"
          target="_blank"
          rel="noopener noreferrer"
          className="instagram-handle group mt-3 inline-flex w-full items-center justify-center gap-2 text-md text-gold transition-colors duration-200 hover:text-accent"
          aria-label="Visit Mioralane on Instagram"
        >
          <span>@mioralane</span>
          <ArrowRight className="instagram-handle-arrow h-3.5 w-3.5 transition-transform duration-200 group-hover:translate-x-0.5" />
        </a>

        <div className="home-section-content relative mx-auto max-w-[1200px]">
          <button
            onClick={() => scrollByCards(-1)}
            className="absolute -left-5 top-1/2 z-10 hidden h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-border bg-white text-ink transition-colors duration-200 hover:bg-ink hover:text-white md:flex"
            aria-label="Previous posts"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>

          <div className="overflow-hidden rounded-2xl">
            <div
              ref={trackRef}
              className="flex gap-4 overflow-x-auto scroll-smooth pb-2 snap-x snap-mandatory [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
            >
              {IG_POSTS.map((post) => (
                <a
                  key={post.id}
                  data-card
                  href={post.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group relative aspect-[9/16] w-[148px] flex-shrink-0 snap-start overflow-hidden rounded-2xl sm:w-[192px] md:w-auto md:basis-[calc((100%-4rem)/5)]"
                >
                  <Image
                    src={post.image}
                    alt="Mioralane Instagram post"
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-[1.02]"
                    sizes="(max-width: 640px) 148px, (max-width: 1024px) 192px, 20vw"
                  />
                  <span className="absolute inset-0 flex items-center justify-center">
                    <span className="flex h-11 w-11 items-center justify-center rounded-full bg-white text-black shadow-[0_2px_8px_rgba(26,26,26,0.14)] transition-transform duration-200 group-hover:scale-[1.05]">
                      <Play className="ml-0.5 h-4 w-4 fill-current" />
                    </span>
                  </span>
                </a>
              ))}
            </div>
          </div>

          <button
            onClick={() => scrollByCards(1)}
            className="absolute -right-5 top-1/2 z-10 hidden h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-border bg-white text-ink transition-colors duration-200 hover:bg-ink hover:text-white md:flex"
            aria-label="Next posts"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
      </div>
      <style jsx>{`
        .instagram-handle {
          animation: handle-focus 2.8s ease-in-out infinite;
          text-shadow:
            0 0 10px rgba(139, 115, 85, 0.2),
            0 0 18px rgba(232, 166, 154, 0.12);
          filter: saturate(1.08);
        }

        .instagram-handle-arrow {
          animation: handle-arrow-focus 2.8s ease-in-out infinite;
        }

        .instagram-handle:hover,
        .instagram-handle:hover .instagram-handle-arrow {
          animation-play-state: paused;
        }

        @keyframes handle-focus {
          0%,
          100% {
            transform: translateX(0);
          }
          50% {
            transform: translateX(2px);
          }
        }

        @keyframes handle-arrow-focus {
          0%,
          100% {
            transform: translateX(0);
          }
          50% {
            transform: translateX(3px);
          }
        }
      `}</style>
    </section>
  );
}
