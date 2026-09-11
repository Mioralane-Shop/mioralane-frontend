import api from "@/lib/axios";
import type { ActivePromotion, PromotionValidationResponse } from "@/types/promotion";

export const promotionService = {
  async getActive() {
    const { data } = await api.get<{ success: boolean; campaign: ActivePromotion | null }>("/promotions/active");
    return data.campaign;
  },

  async validate(payload: {
    items: Array<{ itemId: string; itemType: "product" | "combo"; quantity: number }>;
    deliveryZone: "inside_dhaka" | "outside_dhaka";
    couponCode?: string;
  }) {
    const { data } = await api.post<PromotionValidationResponse>("/promotions/validate", payload);
    return data;
  },
};
