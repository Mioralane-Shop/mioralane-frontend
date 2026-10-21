"use client";

import { useRef, useState } from "react";
import { Play, ChevronLeft, ChevronRight, ArrowRight, ExternalLink } from "lucide-react";
import { SectionHeading } from "@/components/common/section-heading";
import { useInstagramFeed } from "@/hooks/use-instagram-feed";
import type { InstagramFeedVideo } from "@/types/instagram";

/**
 * "Follow Us on Instagram" homepage showcase.
 *
 * Renders ONLY the reels the admin selected (backend `GET /api/instagram/feed`,
 * which serves the saved selection from MongoDB — no Meta call from the
 * browser). When nothing is selected yet the whole section is omitted: the
 * homepage never shows placeholder posts.
 *
 * Performance rules kept here on purpose:
 *  - thumbnails load lazily as plain images (Instagram's CDN is not in the
 *    next/image allowlist, and this component must never throw on it);
 *  - a video is mounted only when its play button is pressed, and only ONE
 *    video can play at a time (`playingId`);
 *  - direct playback is muted inline `<video>`; when the CDN URL is missing,
 *    the play action falls back to the Instagram permalink instead of a
 *    broken player.
 */
export function InstagramSection() {
  const { data: videos } = useInstagramFeed();
  const [playingId, setPlayingId] = useState<string | null>(null);
  const trackRef = useRef<HTMLDivElement>(null);

  const scrollByCards = (dir: number) => {
    const el = trackRef.current;
    if (!el) return;
    const card = el.querySelector<HTMLElement>("[data-card]");
    const amount = card ? card.offsetWidth + 16 : 300;
    el.scrollBy({ left: dir * amount, behavior: "smooth" });
  };

  const startPlayback = (video: InstagramFeedVideo) => {
    // No usable video URL → take the visitor to the reel on Instagram instead
    // of rendering a player that cannot work.
    if (!video.mediaUrl) {
      if (video.permalink) {
        window.open(video.permalink, "_blank", "noopener,noreferrer");
      }
      return;
    }

    setPlayingId((current) => (current === video.id ? null : video.id));
  };

  // Graceful fallback: no featured reels configured yet → hide the section.
  if (!videos || videos.length === 0) {
    return null;
  }

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
          className="instagram-handle group mt-3 inline-flex w-full items-center justify-center gap-2 text-base text-gold transition-colors duration-200 hover:text-accent"
          aria-label="Visit Mioralane on Instagram"
        >
          <span>@mioralane</span>
          <ArrowRight className="instagram-handle-arrow h-3.5 w-3.5 transition-transform duration-200 group-hover:translate-x-0.5" />
        </a>

        <div className="home-section-content relative mx-auto max-w-[1200px]">
          <button
            onClick={() => scrollByCards(-1)}
            className="absolute -left-2 top-1/2 z-10 hidden h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-border bg-white text-ink transition-colors duration-200 hover:bg-ink hover:text-white md:flex xl:-left-5"
            aria-label="Previous posts"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>

          <div className="overflow-hidden rounded-2xl">
            <div
              ref={trackRef}
              className="flex gap-4 overflow-x-auto scroll-smooth pb-2 snap-x snap-mandatory [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
            >
              {videos.map((video) => {
                const isPlaying = playingId === video.id;

                return (
                  <div
                    key={video.id}
                    data-card
                    className="group relative aspect-[9/16] w-[148px] shrink-0 snap-start overflow-hidden rounded-2xl bg-[#F8F6F2] sm:w-[192px] md:w-auto md:basis-[calc((100%-4rem)/5)]"
                  >
                    {isPlaying && video.mediaUrl ? (
                      // Mounted only while this reel is the one playing.
                      <video
                        src={video.mediaUrl}
                        poster={video.thumbnailUrl}
                        autoPlay
                        muted
                        loop
                        controls
                        playsInline
                        preload="metadata"
                        className="absolute inset-0 h-full w-full object-cover"
                      />
                    ) : (
                      <>
                        {video.thumbnailUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={video.thumbnailUrl}
                            alt={video.caption ?? "Mioralane Instagram reel"}
                            loading="lazy"
                            className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.02]"
                          />
                        ) : (
                          <div className="absolute inset-0 flex items-center justify-center text-ink/25">
                            <Play className="h-8 w-8" />
                          </div>
                        )}
                        <span className="absolute inset-0 flex items-center justify-center">
                          <button
                            type="button"
                            onClick={() => startPlayback(video)}
                            className="flex h-11 w-11 items-center justify-center rounded-full bg-white text-black shadow-[0_2px_8px_rgba(26,26,26,0.14)] transition-transform duration-200 group-hover:scale-[1.05]"
                            aria-label={video.mediaUrl ? "Play reel" : "Open reel on Instagram"}
                          >
                            <Play className="ml-0.5 h-4 w-4 fill-current" />
                          </button>
                        </span>
                      </>
                    )}

                    {video.permalink ? (
                      <a
                        href={video.permalink}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label="Open reel on Instagram"
                        className="absolute right-2 top-2 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-black/45 text-white transition-colors hover:bg-black/65"
                      >
                        <ExternalLink className="h-3.5 w-3.5" />
                      </a>
                    ) : null}
                  </div>
                );
              })}
            </div>
          </div>

          <button
            onClick={() => scrollByCards(1)}
            className="absolute -right-2 top-1/2 z-10 hidden h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-border bg-white text-ink transition-colors duration-200 hover:bg-ink hover:text-white md:flex xl:-right-5"
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
            0 0 18px rgba(251, 111, 146, 0.12);
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
