import api from "@/lib/axios";
import type { Brand } from "@/types/brand";

/**
 * Public brand reads. Both endpoints are unauthenticated and return the same
 * envelope, `{ success: true, brands: [...] }`.
 *
 * The filtering belongs to the server, deliberately: `/brands/marquee` already
 * applies "visible AND opted in AND carrying a logo", so the homepage cannot
 * disagree with the API about what the marquee shows, and a brand added to the
 * marquee through the admin panel appears without a client-side change.
 *
 * `data.brands ?? []` — the endpoints always include the key, but a proxy or an
 * older deployment answering with a bare `{ success: true }` should degrade to an
 * empty list rather than hand `undefined` to a `.map()`.
 */
export const brandService = {
  /** Visible brands, in display order. */
  async getPublicBrands(): Promise<Brand[]> {
    const { data } = await api.get<{ success: boolean; brands: Brand[] }>("/brands");

    return data.brands ?? [];
  },

  /** The homepage marquee subset: visible + `showInMarquee` + a logo. */
  async getMarqueeBrands(): Promise<Brand[]> {
    const { data } = await api.get<{ success: boolean; brands: Brand[] }>("/brands/marquee");

    return data.brands ?? [];
  },
};
