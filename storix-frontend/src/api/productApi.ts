import axiosClient from "./axiosClient";
import type { Product, ProductInput } from "../types";

interface ProductListParams {
  category?: string;
  page?: number;
}

interface ProductListResponse {
  items: Product[];
  total: number;
  page: number;
}

export const productApi = {
  list: (params?: ProductListParams) =>
    axiosClient.get<ProductListResponse>("/products", { params }),
  getById: (id: string) => axiosClient.get<Product>(`/products/${id}`),
  create: (data: ProductInput) => axiosClient.post<Product>("/products", data),
  update: (id: string, data: Partial<ProductInput>) =>
    axiosClient.put<Product>(`/products/${id}`, data),
  remove: (id: string) => axiosClient.delete(`/products/${id}`),
};