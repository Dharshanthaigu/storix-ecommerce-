import axiosClient from "./axiosClient";
import type { Coupon } from "../types/index";

interface ApplyCouponResponse {
  code: string;
  discount: number;
  newTotal: number;
}

interface CreateCouponPayload {
  code: string;
  discountType: "percentage" | "flat";
  discountValue: number;
  minOrderValue?: number;
  maxDiscount?: number;
  expiresAt: string;
  usageLimit?: number;
}

export const couponApi = {
  apply: (code: string, cartTotal: number) =>
    axiosClient.post<ApplyCouponResponse>("/coupons/apply", { code, cartTotal }),
  list: () => axiosClient.get<{ coupons: Coupon[] }>("/coupons"),
  create: (data: CreateCouponPayload) =>
    axiosClient.post<{ message: string; coupon: Coupon }>("/coupons", data),
};