import { Router } from "express";
import { verifyToken , requireAdmin } from "../middleware/authmiddleware";
import { createOrder ,getMyOrders, updateOrderStatus } from "../controllers/orderController";

const router = Router();

// Create order — logged-in user only
router.post("/", verifyToken, createOrder);
router.get("/my-orders", verifyToken, getMyOrders);
router.patch("/:id/status", verifyToken, requireAdmin, updateOrderStatus);

export default router;