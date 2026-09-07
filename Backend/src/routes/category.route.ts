import { Router } from "express";
import {
    getAllCategories,
    getCategoryById,
    createCategory,
    updateCategory,
    deleteCategory,
    getCategoriesTree,
} from "../controllers/Category.controller.js";

const router = Router();

/* -------------------------------------------------------------------------- */
/*                        CATEGORY ROUTES                                   */
/* -------------------------------------------------------------------------- */

// Get categories tree (hierarchical structure)
router.get("/tree", getCategoriesTree);

// Get all categories
router.get("/", getAllCategories);

// Get category by ID
router.get("/:id", getCategoryById);

// Create category
router.post("/", createCategory);

// Update category
router.put("/:id", updateCategory);

// Delete category
router.delete("/:id", deleteCategory);

export default router;
