import mongoose, { Document, Schema } from "mongoose";

export interface ICoupon extends Document {
    code: string;
    discountType: "percentage" | "flat";
    discountValue: number;
    minOrderValue: number;
    maxDiscount?: number;
    expiresAt: Date;
    usageLimit: number;
    usedCount: number;
    isActive: boolean;
}

const CouponSchema = new Schema<ICoupon>({
    code: {
        type: String,
        required: true,
        unique: true,
        uppercase: true,
        trim: true
    },
    discountType: {
        type: String,
        enum: ["percentage", "flat"],
        required: true
    },
    discountValue: {
        type: Number,
        required: true,
        min: 0,
    },
    minOrderValue: {
        type: Number,
        default: 0,
    },
    maxDiscount: {
        type: Number,
    },
    expiresAt: {
        type: Date,
        required: true,
    },
    usageLimit: {
        type: Number,
        default: 1,
    },
    usedCount: {
        type: Number,
        default: 0,
    },
    isActive: {
        type: Boolean,
        default: true,
    },
},
    { timestamps: true }

);

const Coupon = mongoose.model<ICoupon>("Coupon", CouponSchema);

export default Coupon;