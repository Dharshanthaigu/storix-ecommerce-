import { Router } from "express";
import { verifyToken , requireAdmin } from "../middleware/authmiddleware";
import { createOrder ,getMyOrders,getAllOrders, getOrderById, updateOrderStatus } from "../controllers/orderController";

const router = Router();

// Create order — logged-in user only
router.post("/", verifyToken, createOrder);
router.get("/my-orders", verifyToken, getMyOrders);
router.get("/:id", verifyToken, getOrderById);
router.get("/", verifyToken, requireAdmin, getAllOrders);
router.patch("/:id/status", verifyToken, requireAdmin, updateOrderStatus);

export default router;