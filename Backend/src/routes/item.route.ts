import { Router } from "express";
import {
    getAllItems,
    getItemById,
    createItem,
    updateItem,
    deleteItem,
    searchItems,
    getLowStockItems,
    getInventoryValue,
    adjustStock,
    getCategoryStats,
    getWarehouseAnalytics
} from "../controllers/Item.controller.js";

const router = Router();

/* -------------------------------------------------------------------------- */
/*                        ANALYTICS & STATS ROUTES                           */
/* -------------------------------------------------------------------------- */

// Get warehouse analytics
router.get("/analytics/warehouse", getWarehouseAnalytics);

// Get inventory value statistics
router.get("/analytics/inventory-value", getInventoryValue);

// Get category statistics
router.get("/analytics/category", getCategoryStats);

// Get low stock items
router.get("/stock/low-stock", getLowStockItems);

// Search items
router.get("/search", searchItems);

/* -------------------------------------------------------------------------- */
/*                        ITEM OPERATIONS ROUTES                             */
/* -------------------------------------------------------------------------- */

// Get all items
router.get("/", getAllItems);

// Get item by ID
router.get("/:id", getItemById);

// Create item
router.post("/", createItem);

// Update item
router.put("/:id", updateItem);

// Adjust stock (inbound/outbound/damage/return)
router.post("/:id/adjust-stock", adjustStock);

// Delete item
router.delete("/:id", deleteItem);

export default router;