import { ItemModel } from "../models/Item.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import ApiResponse from "../utils/apiResponse.js";
import ApiError from "../utils/apiError.js";
import { CreateItemSchema, UpdateItemSchema, GetItemSchema, DeleteItemSchema, AdjustStockSchema } from "../validators/item.schema.js";
import { ZodError } from "zod";

/* -------------------------------------------------------------------------- */
/*                           GET ALL ITEMS                                   */
/* -------------------------------------------------------------------------- */

export const getAllItems = asyncHandler(async (req, res) => {
    try {
        const filter: any = { status: "active" };
        const items = await ItemModel.find(filter)
            .sort({ createdAt: -1 })
            .lean();

        return res.status(200).json(
            new ApiResponse(200, items, "Items fetched successfully")
        );
    } catch (error) {
        throw new ApiError(500, "Failed to fetch items", [], "");
    }
});

/* -------------------------------------------------------------------------- */
/*                           GET ITEM BY ID                                  */
/* -------------------------------------------------------------------------- */

export const getItemById = asyncHandler(async (req, res) => {
    try {
        const { id } = req.params;

        const validation = GetItemSchema.safeParse({ id });
        if (!validation.success) {
            throw new ApiError(
                400,
                "Invalid item ID",
                validation.error.issues,
                ""
            );
        }

        const item = await ItemModel.findById(id);
        if (!item) {
            throw new ApiError(404, "Item not found", [], "");
        }

        return res.status(200).json(
            new ApiResponse(200, item, "Item fetched successfully")
        );
    } catch (error) {
        if (error instanceof ApiError) throw error;
        throw new ApiError(500, "Failed to fetch item", [], "");
    }
});

/* -------------------------------------------------------------------------- */
/*                           CREATE ITEM                                     */
/* -------------------------------------------------------------------------- */

export const createItem = asyncHandler(async (req, res) => {
    try {
        const { location, ...incomingBody } = req.body ?? {};

        const normalizedBody = {
            ...incomingBody,
            sku: incomingBody.sku || `SKU-${Date.now().toString().slice(-6)}`,
            name: incomingBody.name?.trim(),
            category: incomingBody.category?.trim(),
            description: incomingBody.description ?? incomingBody.notes ?? "",
            notes: incomingBody.notes ?? incomingBody.description ?? "",
            quantity: Number(incomingBody.quantity ?? 0),
            unit: incomingBody.unit || "piece",
            unitCost: Number(incomingBody.unitCost ?? 0),
            sellingPrice: Number(incomingBody.sellingPrice ?? incomingBody.unitCost ?? 0),
            reorderThreshold: Number(incomingBody.reorderThreshold ?? 0),
            maxStock: Number(incomingBody.maxStock ?? Math.max(Number(incomingBody.quantity ?? 0), 1)),
            safetyStock: Number(incomingBody.safetyStock ?? 0),
            status: incomingBody.status || "active",
            location: location || incomingBody.location || "",
            warehouseStocks: incomingBody.warehouseStocks?.length
                ? incomingBody.warehouseStocks
                : [{
                    location: "aisle_a",
                    quantity: Number(incomingBody.quantity ?? 0),
                    binNumber: location || incomingBody.location || "MAIN"
                }],
            lastRestocked: incomingBody.lastRestocked || new Date().toISOString()
        };

        const validation = CreateItemSchema.safeParse(normalizedBody);
        if (!validation.success) {
            throw new ApiError(
                400,
                "Validation failed",
                validation.error.issues,
                ""
            );
        }

        // Check if SKU already exists
        const existingItem = await ItemModel.findOne({ sku: validation.data.sku });
        if (existingItem) {
            throw new ApiError(
                409,
                "Item with this SKU already exists",
                [],
                ""
            );
        }

        const item = new ItemModel(validation.data);
        await item.save();

        return res.status(201).json(
            new ApiResponse(201, item, "Item created successfully")
        );
    } catch (error) {
        if (error instanceof ApiError) throw error;
        throw new ApiError(500, "Failed to create item", [], "");
    }
});

/* -------------------------------------------------------------------------- */
/*                           UPDATE ITEM                                     */
/* -------------------------------------------------------------------------- */

export const updateItem = asyncHandler(async (req, res) => {
    try {
        const { id } = req.params;

        const validation = UpdateItemSchema.safeParse(req.body);
        if (!validation.success) {
            throw new ApiError(
                400,
                "Validation failed",
                validation.error.issues,
                ""
            );
        }

        // Check if item exists
        const item = await ItemModel.findById(id);
        if (!item) {
            throw new ApiError(404, "Item not found", [], "");
        }

        // If updating SKU, check for duplicates
        if (validation.data.sku && validation.data.sku !== item.sku) {
            const existingItem = await ItemModel.findOne({ sku: validation.data.sku });
            if (existingItem) {
                throw new ApiError(
                    409,
                    "Item with this SKU already exists",
                    [],
                    ""
                );
            }
        }

        // Update lastRestocked if quantity is being updated
        const updateData: any = { ...validation.data };
        if (updateData.quantity !== undefined && updateData.quantity !== item.quantity) {
            updateData.lastRestocked = new Date();
        }

        const updatedItem = await ItemModel.findByIdAndUpdate(
            id,
            { $set: updateData },
            { new: true, runValidators: true }
        );

        return res.status(200).json(
            new ApiResponse(200, updatedItem, "Item updated successfully")
        );
    } catch (error) {
        if (error instanceof ApiError) throw error;
        throw new ApiError(500, "Failed to update item", [], "");
    }
});

/* -------------------------------------------------------------------------- */
/*                           DELETE ITEM                                     */
/* -------------------------------------------------------------------------- */

export const deleteItem = asyncHandler(async (req, res) => {
    try {
        const { id } = req.params;

        const validation = DeleteItemSchema.safeParse({ id });
        if (!validation.success) {
            throw new ApiError(
                400,
                "Invalid item ID",
                validation.error.issues,
                ""
            );
        }

        const item = await ItemModel.findByIdAndDelete(id);
        if (!item) {
            throw new ApiError(404, "Item not found", [], "");
        }

        return res.status(200).json(
            new ApiResponse(200, null, "Item deleted successfully")
        );
    } catch (error) {
        if (error instanceof ApiError) throw error;
        throw new ApiError(500, "Failed to delete item", [], "");
    }
});

/* -------------------------------------------------------------------------- */
/*                       SEARCH & FILTER ITEMS                               */
/* -------------------------------------------------------------------------- */

export const searchItems = asyncHandler(async (req, res) => {
    try {
        const { q, category, status } = req.query;

        const filter: any = { status: status || "active" };

        if (q) {
            filter.$or = [
                { sku: { $regex: q, $options: "i" } },
                { name: { $regex: q, $options: "i" } },
                { description: { $regex: q, $options: "i" } }
            ];
        }

        if (category) {
            filter.category = category;
        }

        const items = await ItemModel.find(filter)
            .sort({ createdAt: -1 })
            .lean();

        return res.status(200).json(
            new ApiResponse(200, items, "Items searched successfully")
        );
    } catch (error) {
        throw new ApiError(500, "Failed to search items", [], "");
    }
});

/* -------------------------------------------------------------------------- */
/*                       GET LOW STOCK ITEMS                                 */
/* -------------------------------------------------------------------------- */

export const getLowStockItems = asyncHandler(async (req, res) => {
    try {
        const filter: any = {
            $expr: { $lte: ["$quantity", "$reorderThreshold"] },
            status: "active"
        };

        const items = await ItemModel.find(filter)
            .sort({ quantity: 1 })
            .lean();

        return res.status(200).json(
            new ApiResponse(200, items, "Low stock items fetched successfully")
        );
    } catch (error) {
        throw new ApiError(500, "Failed to fetch low stock items", [], "");
    }
});

/* -------------------------------------------------------------------------- */
/*                       GET INVENTORY VALUE                                 */
/* -------------------------------------------------------------------------- */

export const getInventoryValue = asyncHandler(async (req, res) => {
    try {
        const result = await ItemModel.aggregate([
            {
                $match: { status: "active" }
            },
            {
                $group: {
                    _id: null,
                    totalValue: {
                        $sum: { $multiply: ["$quantity", "$unitCost"] }
                    },
                    totalItems: { $sum: 1 },
                    totalQuantity: { $sum: "$quantity" }
                }
            }
        ]);

        const data = result[0] || {
            totalValue: 0,
            totalItems: 0,
            totalQuantity: 0
        };

        return res.status(200).json(
            new ApiResponse(200, data, "Inventory value calculated successfully")
        );
    } catch (error) {
        throw new ApiError(500, "Failed to calculate inventory value", [], "");
    }
});

/* -------------------------------------------------------------------------- */
/*                       ADJUST STOCK                                        */
/* -------------------------------------------------------------------------- */

export const adjustStock = asyncHandler(async (req, res) => {
    try {
        const { id } = req.params;

        const validation = AdjustStockSchema.safeParse(req.body);
        if (!validation.success) {
            throw new ApiError(
                400,
                "Validation failed",
                validation.error.issues,
                ""
            );
        }

        const { quantity, reason, reference, type = "adjustment" } = validation.data;

        const item = await ItemModel.findById(id);
        if (!item) {
            throw new ApiError(404, "Item not found", [], "");
        }

        const newQuantity = item.quantity + quantity;
        if (newQuantity < 0) {
            throw new ApiError(
                400,
                `Cannot reduce stock below 0. Current: ${item.quantity}, Requested: ${quantity}`,
                [],
                ""
            );
        }

        item.quantity = newQuantity;
        item.lastRestocked = new Date();
        
        // Add stock movement
        item.stockMovements.push({
            type,
            quantity: Math.abs(quantity),
            reason,
            reference,
            movedAt: new Date()
        } as any);

        await item.save();

        return res.status(200).json(
            new ApiResponse(200, item, "Stock adjusted successfully")
        );
    } catch (error) {
        if (error instanceof ApiError) throw error;
        throw new ApiError(500, "Failed to adjust stock", [], "");
    }
});

/* -------------------------------------------------------------------------- */
/*                       GET CATEGORY STATISTICS                             */
/* -------------------------------------------------------------------------- */

export const getCategoryStats = asyncHandler(async (req, res) => {
    try {
        const stats = await ItemModel.aggregate([
            {
                $match: { status: "active" }
            },
            {
                $group: {
                    _id: "$category",
                    count: { $sum: 1 },
                    totalQuantity: { $sum: "$quantity" },
                    totalValue: { $sum: { $multiply: ["$quantity", "$unitCost"] } },
                    low: {
                        $sum: {
                            $cond: [
                                { $lte: ["$quantity", "$reorderThreshold"] },
                                1,
                                0
                            ]
                        }
                    }
                }
            },
            {
                $sort: { _id: 1 }
            }
        ]);

        return res.status(200).json(
            new ApiResponse(200, stats, "Category statistics fetched successfully")
        );
    } catch (error) {
        throw new ApiError(500, "Failed to fetch category statistics", [], "");
    }
});

/* -------------------------------------------------------------------------- */
/*                       GET WAREHOUSE ANALYTICS                             */
/* -------------------------------------------------------------------------- */

export const getWarehouseAnalytics = asyncHandler(async (req, res) => {
    try {
        const analytics = await ItemModel.aggregate([
            {
                $match: { status: "active" }
            },
            {
                $facet: {
                    totalStats: [
                        {
                            $group: {
                                _id: null,
                                totalItems: { $sum: 1 },
                                totalQuantity: { $sum: "$quantity" },
                                totalValue: {
                                    $sum: { $multiply: ["$quantity", "$unitCost"] }
                                },
                                avgUnitCost: { $avg: "$unitCost" }
                            }
                        }
                    ],
                    lowStockCount: [
                        {
                            $match: {
                                $expr: { $lte: ["$quantity", "$reorderThreshold"] }
                            }
                        },
                        {
                            $count: "count"
                        }
                    ],
                    overStockCount: [
                        {
                            $match: {
                                $expr: { $gte: ["$quantity", "$maxStock"] }
                            }
                        },
                        {
                            $count: "count"
                        }
                    ],
                    byCategory: [
                        {
                            $group: {
                                _id: "$category",
                                count: { $sum: 1 },
                                value: {
                                    $sum: { $multiply: ["$quantity", "$unitCost"] }
                                }
                            }
                        },
                        { $sort: { value: -1 } },
                        { $limit: 10 }
                    ]
                }
            }
        ]);

        const result = {
            ...analytics[0].totalStats[0],
            lowStockCount: analytics[0].lowStockCount[0]?.count || 0,
            overStockCount: analytics[0].overStockCount[0]?.count || 0,
            topCategories: analytics[0].byCategory
        };

        return res.status(200).json(
            new ApiResponse(200, result, "Warehouse analytics fetched successfully")
        );
    } catch (error) {
        throw new ApiError(500, "Failed to fetch warehouse analytics", [], "");
    }
});

/* -------------------------------------------------------------------------- */
/*                       GET INVENTORY REPORTS                                  */
/* -------------------------------------------------------------------------- */

export const getInventoryReports = asyncHandler(async (req, res) => {
    try {
        const filter: any = { status: "active" };
        const items = await ItemModel.find(filter).lean();

        const totalItems = items.length;
        const totalQuantity = items.reduce((sum, item) => sum + Number(item.quantity || 0), 0);
        const totalValue = items.reduce((sum, item) => sum + Number(item.quantity || 0) * Number(item.unitCost || 0), 0);
        const lowStockItems = items.filter((item) => Number(item.quantity || 0) <= Number(item.reorderThreshold || 0));

        const stockHealth = {
            healthy: items.filter((item) => Number(item.quantity || 0) > Number(item.reorderThreshold || 0) * 1.5).length,
            watch: items.filter((item) => {
                const quantity = Number(item.quantity || 0);
                const reorderThreshold = Number(item.reorderThreshold || 0);
                return quantity > reorderThreshold && quantity <= reorderThreshold * 1.5;
            }).length,
            reorder: lowStockItems.length
        };

        const byCategoryMap = new Map<string, any>();
        items.forEach((item) => {
            const category = item.category || "Uncategorized";
            const existing = byCategoryMap.get(category) || {
                category,
                count: 0,
                totalQuantity: 0,
                totalValue: 0,
                low: 0
            };

            const quantity = Number(item.quantity || 0);
            const unitCost = Number(item.unitCost || 0);

            existing.count += 1;
            existing.totalQuantity += quantity;
            existing.totalValue += quantity * unitCost;
            existing.low += quantity <= Number(item.reorderThreshold || 0) ? 1 : 0;

            byCategoryMap.set(category, existing);
        });

        const byCategory = [...byCategoryMap.values()].sort((a, b) => b.totalValue - a.totalValue);

        return res.status(200).json(
            new ApiResponse(
                200,
                {
                    overview: {
                        totalItems,
                        totalQuantity,
                        totalValue,
                        lowStockCount: lowStockItems.length,
                        categoryCount: byCategory.length
                    },
                    stockHealth,
                    byCategory,
                    lowStock: lowStockItems
                        .slice()
                        .sort((a, b) => Number(a.quantity || 0) - Number(b.quantity || 0))
                        .slice(0, 6)
                        .map((item) => ({
                            id: item._id,
                            sku: item.sku,
                            name: item.name,
                            category: item.category,
                            quantity: Number(item.quantity || 0),
                            reorderThreshold: Number(item.reorderThreshold || 0),
                            unitCost: Number(item.unitCost || 0)
                        }))
                },
                "Inventory report fetched successfully"
            )
        );
    } catch (error) {
        throw new ApiError(500, "Failed to fetch inventory report", [], "");
    }
});
