import { Router } from "express";
import{
    createCategory,
    getCategories,
    getCategoriesById,
    updateCategory,
    deleteCategory

} from "../controllers/categoryController"

import { verifyToken, requireAdmin } from "../middleware/authmiddleware";

const router = Router();

router.get("/", getCategories);
router.get("/:id", getCategoriesById);
router.post("/", verifyToken,requireAdmin,createCategory);
router.put("/:id", verifyToken, requireAdmin,updateCategory);
router.delete("/:id", verifyToken,requireAdmin,deleteCategory);

export default router;
