import { ItemModel } from "../models/Item.model.js";
import { ItemDocument } from "../models/Item.model.js";
import { ItemStatus } from "../models/Item.model.js";
import ApiError from "../utils/apiError.js";
import { ERROR_MESSAGES, SUCCESS_MESSAGES } from "../constants/index.js";
import { StockAdjustmentPayload, ItemFilter, FindOptions } from "../interfaces/index.js";

/* -------------------------------------------------------------------------- */
/*                          ITEM SERVICE                                    */
/* -------------------------------------------------------------------------- */

export class ItemService {
    /**
     * Fetch all items with optional filtering
     */
    static async getAllItems(filter: ItemFilter = {}, options: FindOptions = {}) {
        try {
            const query: any = { status: ItemStatus.ACTIVE };

            if (filter.category) query.category = filter.category;
            if (filter.subcategory) query.subcategory = filter.subcategory;
            if (filter.supplier) query.supplier = filter.supplier;
            if (filter.isLowStock) {
                query.$expr = { $lt: ["$quantity", "$reorderThreshold"] };
            }

            const skip = options.skip || 0;
            const limit = options.limit || 10;
            const sort = options.sort || { createdAt: -1 };

            const items = await ItemModel
                .find(query)
                .sort(sort)
                .skip(skip)
                .limit(limit)
                .lean();

            const total = await ItemModel.countDocuments(query);

            return {
                success: true,
                data: items,
                pagination: {
                    skip,
                    limit,
                    total,
                },
            };
        } catch (error) {
            throw new ApiError(500, ERROR_MESSAGES.INTERNAL_ERROR, [], "");
        }
    }

    /**
     * Fetch item by ID
     */
    static async getItemById(id: string) {
        try {
            const item = await ItemModel.findById(id);
            if (!item) {
                throw new ApiError(404, ERROR_MESSAGES.ITEM_NOT_FOUND, [], "");
            }
            return {
                success: true,
                data: item,
            };
        } catch (error) {
            if (error instanceof ApiError) throw error;
            throw new ApiError(500, ERROR_MESSAGES.INTERNAL_ERROR, [], "");
        }
    }

    /**
     * Create a new item
     */
    static async createItem(itemData: any) {
        try {
            // Check if SKU already exists
            const existingItem = await ItemModel.findOne({ sku: itemData.sku });
            if (existingItem) {
                throw new ApiError(409, ERROR_MESSAGES.SKU_EXISTS, [], "");
            }

            const item = new ItemModel(itemData);
            await item.save();

            return {
                success: true,
                data: item,
                message: SUCCESS_MESSAGES.ITEM_CREATED,
            };
        } catch (error) {
            if (error instanceof ApiError) throw error;
            throw new ApiError(500, ERROR_MESSAGES.INTERNAL_ERROR, [], "");
        }
    }

    /**
     * Update an item
     */
    static async updateItem(id: string, updateData: any) {
        try {
            const item = await ItemModel.findByIdAndUpdate(
                id,
                { $set: updateData },
                { new: true, runValidators: true }
            );

            if (!item) {
                throw new ApiError(404, ERROR_MESSAGES.ITEM_NOT_FOUND, [], "");
            }

            return {
                success: true,
                data: item,
                message: SUCCESS_MESSAGES.ITEM_UPDATED,
            };
        } catch (error) {
            if (error instanceof ApiError) throw error;
            throw new ApiError(500, ERROR_MESSAGES.INTERNAL_ERROR, [], "");
        }
    }

    /**
     * Delete an item
     */
    static async deleteItem(id: string) {
        try {
            const item = await ItemModel.findByIdAndDelete(id);
            if (!item) {
                throw new ApiError(404, ERROR_MESSAGES.ITEM_NOT_FOUND, [], "");
            }

            return {
                success: true,
                message: SUCCESS_MESSAGES.ITEM_DELETED,
            };
        } catch (error) {
            if (error instanceof ApiError) throw error;
            throw new ApiError(500, ERROR_MESSAGES.INTERNAL_ERROR, [], "");
        }
    }

    /**
     * Adjust stock for an item
     */
    static async adjustStock(id: string, adjustment: StockAdjustmentPayload) {
        try {
            const item = await ItemModel.findById(id);
            if (!item) {
                throw new ApiError(404, ERROR_MESSAGES.ITEM_NOT_FOUND, [], "");
            }

            const newQuantity = item.quantity + (adjustment.type === "outbound" || adjustment.type === "damage" ? -adjustment.quantity : adjustment.quantity);
            if (newQuantity < 0) {
                throw new ApiError(400, "Insufficient stock for this operation", [], "");
            }

            // Add stock movement record
            item.stockMovements.push({
                type: adjustment.type,
                quantity: adjustment.quantity,
                reason: adjustment.reason,
                reference: adjustment.reference,
                movedAt: new Date(),
            });

            item.quantity = newQuantity;
            await item.save();

            return {
                success: true,
                data: item,
                message: SUCCESS_MESSAGES.STOCK_ADJUSTED,
            };
        } catch (error) {
            if (error instanceof ApiError) throw error;
            throw new ApiError(500, ERROR_MESSAGES.INTERNAL_ERROR, [], "");
        }
    }

    /**
     * Get low stock items
     */
    static async getLowStockItems() {
        try {
            const items = await ItemModel.find({
                $expr: { $lt: ["$quantity", "$reorderThreshold"] },
                status: ItemStatus.ACTIVE,
            } as any).lean();

            return {
                success: true,
                data: items,
            };
        } catch (error) {
            throw new ApiError(500, ERROR_MESSAGES.INTERNAL_ERROR, [], "");
        }
    }

    /**
     * Get inventory value
     */
    static async getInventoryValue() {
        try {
            const result = await ItemModel.aggregate([
                { $match: { status: ItemStatus.ACTIVE } },
                {
                    $group: {
                        _id: null,
                        totalValue: { $sum: { $multiply: ["$quantity", "$unitCost"] } },
                        totalItems: { $sum: 1 },
                        totalQuantity: { $sum: "$quantity" },
                    },
                },
            ]);

            const stats = result[0] || { totalValue: 0, totalItems: 0, totalQuantity: 0 };

            return {
                success: true,
                data: stats,
            };
        } catch (error) {
            throw new ApiError(500, ERROR_MESSAGES.INTERNAL_ERROR, [], "");
        }
    }

    /**
     * Get category statistics
     */
    static async getCategoryStats() {
        try {
            const stats = await ItemModel.aggregate([
                { $match: { status: ItemStatus.ACTIVE } },
                {
                    $group: {
                        _id: "$category",
                        itemCount: { $sum: 1 },
                        totalValue: { $sum: { $multiply: ["$quantity", "$unitCost"] } },
                    },
                },
                { $sort: { totalValue: -1 } },
            ]);

            return {
                success: true,
                data: stats,
            };
        } catch (error) {
            throw new ApiError(500, ERROR_MESSAGES.INTERNAL_ERROR, [], "");
        }
    }

    /**
     * Search items
     */
    static async searchItems(query: string) {
        try {
            const items = await ItemModel.find({
                $or: [
                    { name: { $regex: query, $options: "i" } },
                    { sku: { $regex: query, $options: "i" } },
                    { barcode: { $regex: query, $options: "i" } },
                    { description: { $regex: query, $options: "i" } },
                ],
                status: ItemStatus.ACTIVE,
            } as any).lean();

            return {
                success: true,
                data: items,
            };
        } catch (error) {
            throw new ApiError(500, ERROR_MESSAGES.INTERNAL_ERROR, [], "");
        }
    }

    /**
     * Get warehouse analytics
     */
    static async getWarehouseAnalytics() {
        try {
            const analytics = await ItemModel.aggregate([
                { $match: { status: ItemStatus.ACTIVE } },
                {
                    $group: {
                        _id: null,
                        totalQuantity: { $sum: "$quantity" },
                        reorderNeeded: {
                            $sum: {
                                $cond: [
                                    { $lt: ["$quantity", "$reorderThreshold"] },
                                    1,
                                    0,
                                ],
                            },
                        },
                        totalValue: { $sum: { $multiply: ["$quantity", "$unitCost"] } },
                    },
                },
            ]);

            return {
                success: true,
                data: analytics[0] || { totalQuantity: 0, reorderNeeded: 0, totalValue: 0 },
            };
        } catch (error) {
            throw new ApiError(500, ERROR_MESSAGES.INTERNAL_ERROR, [], "");
        }
    }
}
