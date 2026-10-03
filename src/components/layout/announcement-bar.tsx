"use client";

import { useEffect, useState } from "react";
import type { CSSProperties } from "react";
import Link from "next/link";
import { safeHref } from "@/lib/safe-href";
import { cn } from "@/lib/utils";
import { useAnnouncementBar } from "@/hooks/use-announcement-bar";
import type { AnnouncementBar } from "@/types/announcement";

/**
 * Built-in fallback used until the API answers and whenever no announcement
 * campaign is published, so the bar never flickers or leaves a gap.
 */
const FALLBACK: AnnouncementBar = {
  enabled: true,
  messages: [
    { text: "Free delivery on orders over ৳2,000 in Dhaka" },
    { text: "Cash on Delivery available" },
  ],
  animation: "slide",
  direction: "rtl",
  background: "sheen",
  backgroundColor: "#006400",
  textColor: "#FFEE32",
  intervalSeconds: 4,
  speedSeconds: 18,
};

/** Second stop of the animated colour flow (brand accent-dark) */
const GRADIENT_ACCENT = "#E45377";

/**
 * Bar colours come from the admin settings.
 * - `solid`    flat colour
 * - `sheen`    a colourful light band sweeping over the flat colour
 * - `gradient` the whole background flowing between two colours
 */
function buildBarStyle(
  background: AnnouncementBar["background"],
  backgroundColor: string,
  textColor: string,
  speedSeconds: number,
  direction: AnnouncementBar["direction"],
): CSSProperties {
  const base: CSSProperties = { color: textColor, backgroundColor };
  // Sweep in the same direction the ticker text travels
  const reverse = direction === "rtl" ? " reverse" : "";

  if (background === "sheen") {
    return {
      ...base,
      backgroundImage: `linear-gradient(100deg, transparent 44%, rgba(255,255,255,0.32) 49%, rgba(255,225,229,0.8) 52%, rgba(255,255,255,0.28) 56%, transparent 62%), linear-gradient(${backgroundColor}, ${backgroundColor})`,
      backgroundSize: "260% 100%, 100% 100%",
      backgroundRepeat: "no-repeat, no-repeat",
      animation: `announcement-sheen ${speedSeconds}s linear infinite${reverse}`,
    };
  }

  if (background === "gradient") {
    return {
      ...base,
      backgroundImage: `linear-gradient(90deg, ${backgroundColor}, ${GRADIENT_ACCENT}, ${backgroundColor}, ${GRADIENT_ACCENT}, ${backgroundColor})`,
      backgroundSize: "300% 100%",
      animation: `announcement-gradient ${speedSeconds}s linear infinite${reverse}`,
    };
  }

  return base;
}

const clamp = (value: number, min: number, max: number, fallback: number) =>
  Number.isFinite(value) ? Math.min(Math.max(value, min), max) : fallback;

function MessageText({ text, url }: { text: string; url?: string }) {
  const href = safeHref(url);

  // No link when no URL was supplied, or when the stored URL is outside the
  // allowlist (P1.4 Block B) — `javascript:` values may predate the API fix.
  // The message still reads, it is just not clickable.
  if (!href) {
    return <span>{text}</span>;
  }

  return (
    <Link
      href={href}
      className="underline underline-offset-2 transition-opacity hover:opacity-80"
    >
      {text}
    </Link>
  );
}

export function AnnouncementBar() {
  const { data } = useAnnouncementBar();
  // `undefined` (still loading / request failed) and `null` (no campaign published)
  // both fall back to the built-in messages; only an explicit `enabled: false`
  // from a published campaign hides the bar.
  const config = data ?? FALLBACK;
  const [rotation, setRotation] = useState({ active: 0, previous: null as number | null });

  const messages = config.enabled ? config.messages : [];
  const animation = config.animation ?? "slide";
  const direction = config.direction ?? "rtl";
  const isMarquee = animation === "marquee";
  const intervalMs = clamp(config.intervalSeconds ?? 4, 2, 60, 4) * 1000;
  const speed = clamp(config.speedSeconds ?? 18, 6, 60, 18);
  const rotating = !isMarquee && messages.length > 1;

  const backgroundColor = config.backgroundColor || FALLBACK.backgroundColor;
  const textColor = config.textColor || FALLBACK.textColor;
  const barStyle = buildBarStyle(
    config.background,
    backgroundColor,
    textColor,
    speed,
    direction,
  );

  // Restart the rotation whenever the message list or mode changes.
  useEffect(() => {
    setRotation({ active: 0, previous: null });
  }, [messages.length, animation]);

  useEffect(() => {
    if (!rotating) return;

    const timer = window.setInterval(() => {
      setRotation((current) => ({
        active: (current.active + 1) % messages.length,
        previous: current.active,
      }));
    }, intervalMs);

    return () => window.clearInterval(timer);
  }, [rotating, intervalMs, messages.length]);

  if (!config.enabled || messages.length === 0) {
    return null;
  }

  if (isMarquee) {
    const renderCopy = (copyIndex: number) => (
      <div
        key={copyIndex}
        // Each copy fills the bar (and grows when the messages are longer), so the
        // -50% travel is always exactly one copy → seamless, never an empty gap.
        aria-hidden={copyIndex > 0}
        className="flex min-w-[100vw] shrink-0 items-center justify-around"
      >
        {messages.map((message, index) => (
          <span
            key={`${message.text}-${index}`}
            className="whitespace-nowrap px-5"
          >
            <MessageText text={message.text} url={message.url} />
          </span>
        ))}
      </div>
    );

    return (
      <div
        role="region"
        aria-label="Store announcements"
        className="relative h-9 overflow-hidden text-xs font-medium tracking-wide"
        style={barStyle}
      >
        <div
          className={cn(
            "flex h-full w-max items-center will-change-transform hover:[animation-play-state:paused] motion-reduce:animate-none",
            direction === "ltr"
              ? "animate-[announcement-marquee-reverse_linear_infinite]"
              : "animate-[announcement-marquee_linear_infinite]",
          )}
          style={{ animationDuration: `${speed}s` }}
        >
          {renderCopy(0)}
          {renderCopy(1)}
        </div>
      </div>
    );
  }

  const enterOffset = direction === "ltr" ? -28 : 28;

  return (
    <div
      role="region"
      aria-label="Store announcements"
      className="relative h-9 overflow-hidden text-xs font-medium tracking-wide"
      style={barStyle}
    >
      {messages.map((message, index) => {
        const isActive = index === rotation.active;
        const isLeaving = index === rotation.previous;
        const offset = isActive ? 0 : isLeaving ? -enterOffset : enterOffset;

        return (
          <div
            key={`${message.text}-${index}`}
            aria-hidden={!isActive}
            className={cn(
              "absolute inset-0 flex items-center justify-center px-8 text-center ease-out",
              animation === "fade"
                ? "transition-opacity duration-500"
                : "transition-[transform,opacity] duration-500",
              isActive ? "opacity-100" : "pointer-events-none opacity-0",
            )}
            style={animation === "slide" ? { transform: `translateX(${offset}px)` } : undefined}
          >
            <MessageText text={message.text} url={message.url} />
          </div>
        );
      })}
    </div>
  );
}
