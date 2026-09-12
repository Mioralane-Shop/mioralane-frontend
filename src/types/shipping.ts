import type { CampaignType } from "@/types/promotion";

export type DeliveryZone = "inside_dhaka" | "dhaka_suburban" | "outside_dhaka";

export type ShippingQuoteAddress = {
  name?: string;
  phone?: string;
  division: string;
  district: string;
  area: string;
  address?: string;
  landmark?: string;
};

export type ShippingQuoteResponse = {
  success: boolean;
  quoteFingerprint: string;
  shipping: {
    zone: DeliveryZone;
    baseShippingCharge: number;
    finalShippingCharge: number;
    isFreeDelivery: boolean;
    freeDeliveryReason?: "threshold" | "campaign";
    estimatedMinDays: number;
    estimatedMaxDays: number;
    availability: {
      available: boolean;
      message?: string;
    };
  };
  totals: {
    subtotal: number;
    discountAmount: number;
    shippingFee: number;
    totalAmount: number;
  };
  promotion?: {
    campaignId?: string;
    campaignName?: string;
    campaignType?: CampaignType;
  };
  coupon?: {
    couponId: string;
    code: string;
    discountType: "percentage" | "fixed";
    discountValue: number;
    discountAmount: number;
  };
};
