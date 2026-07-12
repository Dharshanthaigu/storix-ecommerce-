import { z } from "zod"

export const createOrderSchema = z.object({
  items: z
    .array(
      z.object({
        product: z.string().min(1, "Product ID is required"),
        quantity: z.number().min(1, "Quantity must be at least 1"),
      })
    )
    .min(1, "Order must contain at least one item"),
  address: z.string().min(1, "Address is required"),
  idempotencyKey: z.string().min(1, "Idempotency key is required"),
  couponCode: z.string().min(1).optional(),
});
