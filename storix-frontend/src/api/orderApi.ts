import axiosClient from "./axiosClient";
import type { Order, OrderStatus, OrderItem } from "../types/index";

interface CreateOrderPayload {
  items: OrderItem[];
  addressId: string;
  couponCode?: string;
}

export const orderApi = {
  create: (data: CreateOrderPayload) => axiosClient.post<Order>("/orders", data),
  myOrders: () => axiosClient.get<Order[]>("/orders/me"),
  getById: (id: string) => axiosClient.get<Order>(`/orders/${id}`),
  all: (params?: { status?: OrderStatus; page?: number }) =>
    axiosClient.get<{ items: Order[]; total: number }>("/orders", { params }),
  updateStatus: (id: string, status: OrderStatus) =>
    axiosClient.patch<Order>(`/orders/${id}/status`, { status }),
};