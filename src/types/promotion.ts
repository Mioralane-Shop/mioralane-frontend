export type CampaignType =
  | "automatic_discount"
  | "coupon_discount"
  | "announcement"
  | "free_delivery"
  | "free_gift";

export type ActivePromotion = {
  id: string;
  name: string;
  campaignType: CampaignType;
  floatingTab: {
    enabled: boolean;
    title: string;
    subtitle?: string;
  };
  popup: {
    enabled: boolean;
    posterUrl?: string;
    posterAlt?: string;
    actionType: "none" | "link" | "coupon" | "coupon_link";
    ctaLabel?: string;
    ctaUrl?: string;
    coupon?: {
      code: string;
      discountType: "percentage" | "fixed";
      discountValue: number;
    } | null;
  };
  discount?: {
    type: "percentage" | "fixed";
    value: number;
    minimumOrderValue?: number;
    maximumDiscount?: number;
  };
};

export type PromotionTotals = {
  subtotal: number;
  discountAmount: number;
  shippingFee: number;
  totalAmount: number;
};

export type PromotionValidationResponse = {
  success: boolean;
  totals: PromotionTotals;
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
