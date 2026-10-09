import api from "@/lib/axios";
import type { MegaMenu } from "@/types/mega-menu";

export const megaMenuService = {
  /** Mega menu (shop panel) configured in the admin panel */
  async getMegaMenu(): Promise<MegaMenu> {
    const { data } = await api.get<{ success: boolean; menu: MegaMenu }>("/mega-menu");
    return data.menu;
  },
};
