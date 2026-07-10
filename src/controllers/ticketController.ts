import { Response } from "express"
import Ticket from "../models/Ticket"
import { createTicketSchema, updateTicketStatusSchema } from "../validators/ticketValidator"
import { AuthRequest } from "../middleware/authmiddleware"

export const createTicket = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const parsed = createTicketSchema.safeParse(req.body)
        if (!parsed.success) {
            res.status(400).json({ error: parsed.error.issues[0]?.message });
            return;
        }

        if (!req.user?.userId) {
            res.status(401).json({ error: "Unauthorized" });
            return;
        }

        const { subject, message } = parsed.data

        const ticket = await Ticket.create({
            user: req.user.userId,
            subject,
            message,
        })
        res.status(201).json({ message: "Ticket created successfully", ticket })
    }
    catch (error) {
        req.log.error({ err: error }, "Create ticket error");
        res.status(500).json({ error: "Something went wrong while creating ticket" });
    }
}

export const getMyTickets = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        if (!req.user?.userId) {
            res.status(401).json({ error: "Unauthorized" });
            return
        }

        const tickets = await Ticket.find({ user: req.user.userId })
        res.status(200).json({ tickets })
    } catch (error) {
        req.log.error({ err: error }, "Get my tickets error");
        res.status(500).json({ error: "Something went wrong while fetching tickets" });
    }
}

export const getAllTickets = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const tickets = await Ticket.find().populate("user", "name email")
        res.status(200).json({ tickets })
    }
    catch (error) {
        req.log.error({ err: error }, "Get all tickets error");
        res.status(500).json({ error: "Something went wrong while fetching tickets" });
    }
}

export const updateTicketStatus = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const parsed = updateTicketStatusSchema.safeParse(req.body)
        if (!parsed.success) {
            res.status(400).json({ error: parsed.error.issues[0]?.message });
            return;
        }

        const ticketId = req.params.id
        if (!ticketId) {
            res.status(400).json({ error: "Ticket ID is required" });
            return;
        }

        const ticket = await Ticket.findByIdAndUpdate(
            ticketId,
            { status: parsed.data.status },
            { returnDocument: 'after' }
        )

        if (!ticket) {
            res.status(404).json({ error: "Ticket not found" });
            return;
        }
        res.status(200).json({ message: "Ticket status updated", ticket });
    }
    catch (error) {
        req.log.error({ err: error }, "Update ticket error");
        res.status(500).json({ error: "Something went wrong while updating ticket" });
    }
}