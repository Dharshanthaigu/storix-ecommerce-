import { z } from "zod"

// Regex patterns
const phoneRegex = /^[6-9]\d{9}$/; // Indian 10-digit mobile numbers starting 6-9
const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

// Standard strong password policy:
// - min 8 characters
// - at least 1 uppercase letter
// - at least 1 lowercase letter
// - at least 1 number
// - at least 1 special character
const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*#?&^_\-])[A-Za-z\d@$!%*#?&^_\-]{8,}$/;

// blueprint for expected object shape + rules
export const registerSchema = z.object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    email: z.string().regex(emailRegex, "Invalid email address"),
    password: z
        .string()
        .regex(
            passwordRegex,
            "Password must be at least 8 characters and include an uppercase letter, a lowercase letter, a number, and a special character"
        ),
    phone: z.string().regex(phoneRegex, "Enter a valid 10-digit mobile number"),
})

export const loginSchema = z.object({
    email: z.string().regex(emailRegex, "Invalid email address"),
    password: z.string().min(1, "Password is required"),
})

export type RegisterInput = z.infer<typeof registerSchema>;
export type loginInput  =  z.infer<typeof loginSchema>;