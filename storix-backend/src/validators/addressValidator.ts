import { z } from "zod"

export const createAddressSchema = z.object({
    fullName: z.string().min(2, "Full name must be at least 2 characters").trim(),
    phone: z.string().regex(/^[6-9]\d{9}$/, "Enter a valid 10-digit phone number"),
    addressLine1: z.string().min(3, "Address is required").trim(),
    addressLine2: z.string().trim().optional(),
    city: z.string().min(2, "City is required").trim(),
    state: z.string().min(2, "State is required").trim(),
    country: z.string().min(2, "Country is required").trim(),
    pincode: z.string().regex(/^\d{6}$/, "Enter a valid 6-digit pincode"),
    isDefault: z.boolean().optional(),
})

export const updateAddressSchema = z.object({
    fullName: z.string().min(2).trim().optional(),
    phone: z.string().regex(/^[6-9]\d{9}$/).optional(),
    addressLine1: z.string().min(3).trim().optional(),
    addressLine2: z.string().trim().optional(),
    city: z.string().min(2).trim().optional(),
    state: z.string().min(2).trim().optional(),
    country:z.string().min(2).trim().optional(),
    pincode: z.string().regex(/^\d{6}$/).optional(),
    isDefault: z.boolean().optional(),
});