import api from "@/lib/axios";
import type { ShippingQuoteAddress, ShippingQuoteResponse } from "@/types/shipping";

export const shippingService = {
  async quote(payload: {
    items: Array<{ itemId: string; itemType: "product" | "combo"; quantity: number }>;
    shippingAddress: ShippingQuoteAddress;
    couponCode?: string;
  }) {
    const { data } = await api.post<ShippingQuoteResponse>("/shipping/quote", payload);
    return data;
  },
};

