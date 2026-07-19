import axiosClient from "./axiosClient";
import type { User } from "../types/index";

interface AuthResponse {
  user: User;
  token: string;
}

export const authApi = {
  register: (data: { name: string; email: string; password: string; phone: string }) =>
    axiosClient.post<AuthResponse>("/auth/register", data),
  login: (data: { email: string; password: string }) =>
    axiosClient.post<AuthResponse>("/auth/login", data),
  me: () => axiosClient.get<User>("/auth/me"),
};