import { z } from "zod"

export const createCouponSchema = z.object({
    code: z.string().min(3, "Code must be at least 3 characters"),
    discountType: z.enum(["percentage", "flat"]),
    discountValue: z.number().positive("Discount value must be greater than 0"),
    minOrderValue: z.number().min(0).optional(),
    maxDiscount: z.number().positive().optional(),
    expiresAt: z.string().min(1, "Expiry date is required"),
    usageLimit: z.number().min(1).optional(),
}) 