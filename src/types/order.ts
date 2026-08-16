export type DeliveryZone = "inside_dhaka" | "outside_dhaka";
export type PaymentMethod = "cash_on_delivery";
export type PaymentStatus = "pending" | "paid" | "failed";
export type OrderStatus = "pending" | "processing" | "shipped" | "delivered";

export interface OrderItem {
  productId: string;
  title: string;
  quantity: number;
  price: number;
  thumbnail: string;
}

export interface ShippingAddress {
  name: string;
  phone: string;
  deliveryZone: DeliveryZone;
  area: string;
  address: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  items: OrderItem[];
  shippingAddress: ShippingAddress;
  itemsTotal: number;
  shippingFee: number;
  totalAmount: number;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  orderStatus: OrderStatus;
  status?: OrderStatus;
  trackingStatus?: OrderStatus;
  orderId?: string;
  userId?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface CreateOrderPayload {
  items: Array<{
    productId: string;
    quantity: number;
  }>;
  shippingAddress: ShippingAddress;
  paymentMethod?: PaymentMethod;
}

