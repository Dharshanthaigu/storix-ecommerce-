import axiosClient from "./axiosClient";
import type { Address } from "../types/index";

export const addressApi = {
  list: () => axiosClient.get<Address[]>("/addresses"),
  create: (data: Omit<Address, "_id" | "isDefault">) =>
    axiosClient.post<Address>("/addresses", data),
  update: (id: string, data: Partial<Address>) =>
    axiosClient.put<Address>(`/addresses/${id}`, data),
  remove: (id: string) => axiosClient.delete(`/addresses/${id}`),
  setDefault: (id: string) => axiosClient.patch<Address>(`/addresses/${id}/default`),
};