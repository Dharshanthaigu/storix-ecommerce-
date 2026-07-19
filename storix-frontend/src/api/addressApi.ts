import axiosClient from "./axiosClient";
import type { Address } from "../types/index";

interface AddressListResponse { address: Address[] }
interface AddressSingleResponse { message: string; address: Address }

export const addressApi = {
  list: () => axiosClient.get<AddressListResponse>("/addresses"),
  create: (data: Omit<Address, "_id" | "isDefault">) =>
    axiosClient.post<AddressSingleResponse>("/addresses", data),
  update: (id: string, data: Partial<Address>) =>
    axiosClient.put<AddressSingleResponse>(`/addresses/${id}`, data),
  remove: (id: string) => axiosClient.delete(`/addresses/${id}`),
  setDefault: (id: string) => axiosClient.patch<AddressSingleResponse>(`/addresses/${id}/default`),
};