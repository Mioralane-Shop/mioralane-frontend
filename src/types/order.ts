export type DeliveryZone = "inside_dhaka" | "dhaka_suburban" | "outside_dhaka";
export type PaymentMethod = "cash_on_delivery";
export type PaymentStatus = "pending" | "paid" | "failed";
export type OrderStatus = "pending" | "processing" | "shipped" | "delivered" | "cancelled";

export interface OrderItem {
  itemType: "product" | "combo";
  sourceId: string;
  productId?: string;
  comboId?: string;
  title: string;
  quantity: number;
  price: number;
  thumbnail: string;
  fulfillmentType?: "regular" | "pre_order";
  preOrderSnapshot?: {
    expectedArrivalDate?: string;
    customerMessage?: string;
    quantityLimit?: number;
  };
}

export interface ShippingAddress {
  name: string;
  phone: string;
  division?: string;
  district?: string;
  deliveryZone?: DeliveryZone;
  area: string;
  address: string;
  /** Read-only alias returned on order snapshots. */
  fullAddress?: string;
  landmark?: string;
}

export interface OrderShippingSnapshot {
  zone: DeliveryZone;
  baseCharge: number;
  finalCharge: number;
  isFreeDelivery: boolean;
  freeDeliveryReason?: "threshold" | "campaign";
  estimatedMinDays: number;
  estimatedMaxDays: number;
}

export interface Order {
  id: string;
  orderNumber: string;
  items: OrderItem[];
  shippingAddress: ShippingAddress;
  itemsTotal: number;
  shippingFee: number;
  shipping?: OrderShippingSnapshot;
  totalAmount: number;
  discountAmount?: number;
  promotion?: {
    campaignId?: string;
    campaignName?: string;
    campaignType?: string;
  };
  coupon?: {
    couponId?: string;
    code?: string;
    discountType?: string;
    discountValue?: number;
    discountAmount?: number;
  };
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  orderStatus: OrderStatus;
  status?: OrderStatus;
  trackingStatus?: OrderStatus;
  containsPreOrder?: boolean;
  expectedReadinessDate?: string;
  orderId?: string;
  userId?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface CreateOrderPayload {
  items: Array<{
    itemId: string;
    itemType: "product" | "combo";
    title: string;
    price: number;
    thumbnail: string;
    quantity: number;
  }>;
  shippingAddress: ShippingAddress;
  /** Saved address book entry selected at checkout (server resolves the snapshot). */
  addressId?: string;
  paymentMethod?: PaymentMethod;
  couponCode?: string;
  quoteFingerprint?: string;
  /**
   * Checkout retry token (P1.3, R1). Generated once per checkout attempt and
   * reused on every retry of that attempt, so a lost response cannot produce a
   * second order. Sent from the same release the API starts honouring it.
   */
  idempotencyKey?: string;
}
