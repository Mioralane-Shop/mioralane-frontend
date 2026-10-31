import api from "@/lib/axios";
import type { HeroSlide } from "@/types/hero-slide";

export const heroSlideService = {
  /** Active hero slides, in display order (managed in the admin panel). */
  async getHeroSlides(): Promise<HeroSlide[]> {
    const { data } = await api.get<{ success: boolean; slides: HeroSlide[] }>("/hero-slides");

    return data.slides;
  },
};
