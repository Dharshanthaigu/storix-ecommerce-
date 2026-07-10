import { Router } from "express";
import {
  createProduct,
  getProducts,
  getProductById,
  updateProduct,
  deleteProduct,
} from "../controllers/productController";
import { verifyToken, requireAdmin } from "../middleware/authmiddleware"
import upload from "../middleware/uploadMiddleware"

const router = Router();

router.get("/", getProducts);
router.get("/:id", getProductById);
router.post("/", verifyToken, requireAdmin, upload.array("images",5), createProduct);
router.put("/:id", verifyToken, requireAdmin,upload.array("images",5), updateProduct);
router.delete("/:id", verifyToken, requireAdmin, deleteProduct);
router.post("/", verifyToken, requireAdmin, upload.array("images", 5), createProduct);


export default router;