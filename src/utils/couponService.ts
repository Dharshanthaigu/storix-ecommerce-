import Coupon, { ICoupon } from "../models/Coupon";

interface CouponResult {
    coupon: ICoupon;
    discount: number;
    finalTotal: number;
}

export async function validateAndCalculateCoupon(
    code:string,
    orderTotal: number
): Promise<CouponResult>{
    const coupon = await Coupon.findOne({code: code.toUpperCase(), isActive: true})

    if (!coupon) throw new Error("Invalid coupon code");
  if (coupon.expiresAt < new Date()) throw new Error("Coupon has expired");
  if (coupon.usedCount >= coupon.usageLimit) throw new Error("Coupon usage limit reached");
  if (orderTotal < coupon.minOrderValue) {
    throw new Error(`Minimum order value for this coupon is ${coupon.minOrderValue}`);
  }

  let discount = coupon.discountType === "percentage" ? (orderTotal * coupon.discountValue)/100 : coupon.discountValue

  if(coupon.maxDiscount) discount = Math.min(discount,coupon.maxDiscount)
    discount = Math.min(discount,orderTotal)

  return{coupon,discount,finalTotal:orderTotal - discount}

}