import api from "@/lib/axios";
import type { CreateOrderPayload, Order } from "@/types/order";

export const orderService = {
  create: async (orderData: CreateOrderPayload) => {
    const { data } = await api.post<{ success: boolean; order: Order }>("/orders", orderData);
    return data.order;
  },

  getMine: async () => {
    const { data } = await api.get<{ success: boolean; orders: Order[] }>("/orders");
    return data.orders;
  },

  getById: async (id: string) => {
    const { data } = await api.get<{ success: boolean; order: Order }>(`/orders/${id}`);
    return data.order;
  },
};
