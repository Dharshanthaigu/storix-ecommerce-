import axiosClient from "./axiosClient";
import type { Category } from "../types/index";

export const categoryApi = {
  list: () => axiosClient.get<Category[]>("/categories"),
  create: (data: { name: string }) => axiosClient.post<Category>("/categories", data),
  update: (id: string, data: { name: string }) =>
    axiosClient.put<Category>(`/categories/${id}`, data),
  remove: (id: string) => axiosClient.delete(`/categories/${id}`),
};
