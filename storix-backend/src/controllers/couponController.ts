import { Response } from "express";
import Coupon from "../models/Coupon";
import { createCouponSchema } from "../validators/couponValidator";
import { AuthRequest } from "../middleware/authmiddleware";

// Create coupon (admin only)
export const createCoupon = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const parsed = createCouponSchema.safeParse(req.body);
        if (!parsed.success) {
            res.status(400).json({ error: parsed.error.issues[0]?.message });
            return;  
        }
        const { code, discountType, discountValue, expiresAt, minOrderValue, maxDiscount, usageLimit } = parsed.data;

        const couponData = {
            code,
            discountType,
            discountValue,
            expiresAt: new Date(expiresAt),
            ...(minOrderValue !== undefined && { minOrderValue }),
            ...(maxDiscount !== undefined && { maxDiscount }),
            ...(usageLimit !== undefined && { usageLimit }),
        };

        const coupon = await Coupon.create(couponData);
        res.status(201).json({ message: "Coupon created successfully", coupon });
    }
    catch (error: any) {
        if (error.code === 11000) {
            res.status(409).json({ error: "Coupon code already exists" });
            return;
        }
        //console.log("Create coupon error:", error);
        req.log.error({ err: error }, "Create coupon error");
        res.status(500).json({ error: "Something went wrong while creating coupon" });
    }
}

// Get all coupons (admin only)

export const getCoupons = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const coupons = await Coupon.find().sort({ createdAt: -1 })
        res.status(200).json({ coupons });
    }
    catch (error) {
        //console.log("Get coupons error:", error);
        req.log.error({ err: error }, "Get coupons error");
        res.status(500).json({ error: "Something went wrong while fetching coupons" });
    }
}