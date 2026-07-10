import { Router } from "express";
import {
  createTicket,
  getMyTickets,
  getAllTickets,
  updateTicketStatus,
} from "../controllers/ticketController";
import { verifyToken, requireAdmin } from "../middleware/authmiddleware";

const router = Router();

router.post("/", verifyToken, createTicket);
router.get("/my-tickets", verifyToken, getMyTickets);
router.get("/", verifyToken, requireAdmin, getAllTickets);
router.put("/:id/status", verifyToken, requireAdmin, updateTicketStatus);

export default router;