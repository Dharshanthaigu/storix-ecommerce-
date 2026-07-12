import { Router } from "express";
import { verifyToken } from "../middleware/authmiddleware";
import {
  createAddress,
  getAddress,
  updateAddress,
  deleteAddress,
} from "../controllers/addressController";

const router = Router();

// All address routes require a logged-in user (no admin needed — user manages their own addresses)
router.post("/", verifyToken, createAddress);
router.get("/", verifyToken, getAddress);
router.put("/:id", verifyToken, updateAddress);
router.delete("/:id", verifyToken, deleteAddress);

export default router;