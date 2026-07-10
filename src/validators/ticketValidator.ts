import {z} from "zod"

export const createTicketSchema=z.object({
    subject: z.string().min(3,"Subject must be at least 3 characters").trim(),
    message: z.string().min(10, "Message must be at least 10 characters").trim()
});

export const updateTicketStatusSchema = z.object({
    status: z.enum(["open","in_progess","resolved"])
})

