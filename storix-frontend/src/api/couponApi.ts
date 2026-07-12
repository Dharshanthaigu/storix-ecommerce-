import axiosClient from "./axiosClient";
import type { Coupon } from "../types/index";

interface ApplyCouponResponse {
  code: string;
  discount: number;
  newTotal: number;
}

export const couponApi = {
  apply: (code: string, cartTotal: number) =>
    axiosClient.post<ApplyCouponResponse>("/coupons/apply", { code, cartTotal }),
  list: () => axiosClient.get<Coupon[]>("/coupons"),
  create: (data: { code: string; discountPercent: number }) =>
    axiosClient.post<Coupon>("/coupons", data),
};