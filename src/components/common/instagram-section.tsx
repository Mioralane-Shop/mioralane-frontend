"use client";

import { useRef } from "react";
import Image from "next/image";
import { Play, ChevronLeft, ChevronRight } from "lucide-react";

// Placeholder Instagram feed — swap `href` with real post URLs once the IG
// account is connected (Instagram Basic Display API or SnapWidget/EmbedSocial).
const IG_POSTS = [
  {
    id: "1",
    image: "/images/ig-sunscreen.jpg",
    caption: "SUNSCREEN",
    href: "https://www.instagram.com/",
    isVideo: true,
  },
  {
    id: "2",
    image: "/images/ig-serums.jpg",
    caption: null,
    href: "https://www.instagram.com/",
    isVideo: false,
  },
  {
    id: "3",
    image: "/images/ig-kbeauty.jpg",
    caption: "ANUA PADS",
    href: "https://www.instagram.com/",
    isVideo: true,
  },
  {
    id: "4",
    image: "/images/ig-roller.jpg",
    caption: null,
    href: "https://www.instagram.com/",
    isVideo: false,
  },
  {
    id: "5",
    image: "/images/ig-flatlay.jpg",
    caption: "GLASS SKIN",
    href: "https://www.instagram.com/",
    isVideo: false,
  },
  {
    id: "6",
    image: "/images/ig-pink.jpg",
    caption: null,
    href: "https://www.instagram.com/",
    isVideo: true,
  },
  {
    id: "7",
    image: "/images/catalog-serum.jpg",
    caption: "SERUMS",
    href: "https://www.instagram.com/",
    isVideo: false,
  },
  {
    id: "8",
    image: "/images/catalog-cream.jpg",
    caption: null,
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
    <section className="bg-white py-12 md:py-16">
      <div className="mx-auto max-w-[1200px] px-6">
        {/* Heading */}
        <div className="text-center">
          <h2 className="text-2xl font-bold uppercase tracking-tight text-ink md:text-3xl">
            Follow Us on Instagram{" "}
            <span className="text-accent">#KSGLOWIES</span>
          </h2>
          <p className="mt-2 text-sm text-ink/50">177k followers</p>
        </div>

        {/* Carousel */}
        <div className="relative mt-10">
          <button
            onClick={() => scrollByCards(-1)}
            className="absolute -left-4 top-1/2 z-10 hidden h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-ink/10 bg-white shadow-md transition hover:bg-ink hover:text-white md:flex"
            aria-label="Previous posts"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>

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
                className="group relative aspect-square w-[150px] flex-shrink-0 snap-start overflow-hidden rounded-2xl sm:w-[200px] md:w-[220px]"
              >
                <Image
                  src={post.image}
                  alt={post.caption ?? "Mioralane Instagram post"}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                  sizes="(max-width: 640px) 150px, (max-width: 1024px) 200px, 220px"
                />
                {/* Play overlay for reels/videos */}
                {post.isVideo && (
                  <span className="absolute inset-0 flex items-center justify-center">
                    <span className="flex h-11 w-11 items-center justify-center rounded-full bg-white/90 text-ink shadow-md">
                      <Play className="h-4 w-4 fill-current" />
                    </span>
                  </span>
                )}
                {/* Pink caption overlay */}
                {post.caption && (
                  <span className="absolute bottom-3 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-accent px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-white">
                    {post.caption}
                  </span>
                )}
              </a>
            ))}
          </div>

          <button
            onClick={() => scrollByCards(1)}
            className="absolute -right-4 top-1/2 z-10 hidden h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-ink/10 bg-white shadow-md transition hover:bg-ink hover:text-white md:flex"
            aria-label="Next posts"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
      </div>
    </section>
  );
}
