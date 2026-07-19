import axiosClient from "./axiosClient";
import type { Order, OrderStatus } from "../types/index";

interface OrderPayload {
  items: { product: string; quantity: number }[];
  address: string;
  idempotencyKey: string;
  couponCode?: string;
}

export const orderApi = {
  create: (data: OrderPayload) =>
    axiosClient.post<{ message: string; order: Order }>("/orders", data),
  myOrders: () =>
    axiosClient.get<{ orders: Order[] }>("/orders/my-orders"),
  getById: (id: string) =>
    axiosClient.get<{ order: Order }>(`/orders/${id}`),
  all: (params?: { status?: OrderStatus; page?: number }) =>
    axiosClient.get<{ items: Order[]; total: number }>("/orders", { params }),
  updateStatus: (id: string, status: OrderStatus) =>
    axiosClient.patch<{ message: string; order: Order }>(`/orders/${id}/status`, { status }),
};