import { Router } from "express";
import { verifyToken, requireAdmin } from "../middleware/authmiddleware";
import { createCoupon, getCoupons } from "../controllers/couponController";

const router = Router();

router.post("/", verifyToken, requireAdmin, createCoupon);
router.get("/", verifyToken, requireAdmin, getCoupons);

export default router;