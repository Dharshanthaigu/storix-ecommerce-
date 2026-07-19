import axiosClient from "./axiosClient";
import type { Category } from "../types/index";

interface CategoryListResponse {
  category: Category[];
}


export const categoryApi = {
  list: () => axiosClient.get<CategoryListResponse>("/categories"),
  create: (data: { name: string }) => axiosClient.post<Category>("/categories", data),
  update: (id: string, data: { name: string }) =>
    axiosClient.put<Category>(`/categories/${id}`, data),
  remove: (id: string) => axiosClient.delete(`/categories/${id}`),
};
