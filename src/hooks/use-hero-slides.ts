"use client";

import { useQuery } from "@tanstack/react-query";
import { heroSlideService } from "@/services/hero-slide.service";
import type { HeroSlide } from "@/types/hero-slide";

/**
 * Ten minutes: the hero rotation changes a handful of times a year, so a longer
 * window is pure cost saving rather than staleness — the editor sees their change
 * immediately because the admin panel and the storefront are separate clients.
 */
const HERO_SLIDES_STALE_TIME = 10 * 60 * 1000;

export function useHeroSlides() {
  const { data, isLoading } = useQuery<HeroSlide[]>({
    queryKey: ["hero-slides"],
    queryFn: () => heroSlideService.getHeroSlides(),
    staleTime: HERO_SLIDES_STALE_TIME,
    // One retry, then the section falls back to its static banners rather than
    // leaving the top of the homepage empty.
    retry: 1,
  });

  return { slides: data ?? [], isLoading };
}
