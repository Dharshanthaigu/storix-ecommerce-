import { z } from "zod";

export const createProductSchema = z.object({
    name: z.string().min(2, "Product name must be at least 2 characters").trim(),
    description: z.string().trim().optional(),
    price: z.coerce.number().positive("Price must be greater than 0"),
    stock: z.coerce.number().min(0, "Stock cannot be negative"),
    category: z.string().min(1, "Category is required"),
    images: z.array(z.string()).optional(),
})

export const updateProductSchema = z.object({
    name: z.string().min(2).trim().optional(),
    description: z.string().trim().optional(),
    price: z.coerce.number().positive().optional(),
    stock: z.coerce.number().min(0).optional(),
    category: z.string().min(1).optional(),
    images: z.array(z.string()).optional(),
});