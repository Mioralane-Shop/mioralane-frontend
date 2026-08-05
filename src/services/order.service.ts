import api from "@/lib/axios";
import type { Order } from "@/types/product";

export const orderService = {
  create: async (orderData: {
    items: { productId: string; quantity: number }[];
    shippingAddress: Record<string, string>;
  }) => {
    const { data } = await api.post<Order>("/orders", orderData);
    return data;
  },

  getAll: async () => {
    const { data } = await api.get<Order[]>("/orders");
    return data;
  },

  getById: async (id: string) => {
    const { data } = await api.get<Order>(`/orders/${id}`);
    return data;
  },
};
