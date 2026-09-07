import { CategoryModel } from "../models/Category.model.js";
import ApiError from "../utils/apiError.js";
import { ERROR_MESSAGES, SUCCESS_MESSAGES } from "../constants/index.js";
import { FindOptions, CategoryFilter } from "../interfaces/index.js";

/* -------------------------------------------------------------------------- */
/*                          CATEGORY SERVICE                                */
/* -------------------------------------------------------------------------- */

export class CategoryService {
    /**
     * Fetch all categories
     */
    static async getAllCategories(filter: CategoryFilter = {}, options: FindOptions = {}) {
        try {
            const query: any = {};

            if (filter.isActive !== undefined) query.isActive = filter.isActive;
            if (filter.parent) query.parent = filter.parent;

            const skip = options.skip || 0;
            const limit = options.limit || 10;
            const sort = options.sort || { createdAt: -1 };

            const categories = await CategoryModel
                .find(query)
                .sort(sort)
                .skip(skip)
                .limit(limit)
                .lean();

            const total = await CategoryModel.countDocuments(query);

            return {
                success: true,
                data: categories,
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
     * Fetch category by ID
     */
    static async getCategoryById(id: string) {
        try {
            const category = await CategoryModel.findById(id);
            if (!category) {
                throw new ApiError(404, ERROR_MESSAGES.CATEGORY_NOT_FOUND, [], "");
            }
            return {
                success: true,
                data: category,
            };
        } catch (error) {
            if (error instanceof ApiError) throw error;
            throw new ApiError(500, ERROR_MESSAGES.INTERNAL_ERROR, [], "");
        }
    }

    /**
     * Create a new category
     */
    static async createCategory(categoryData: any) {
        try {
            // Check if category with same name or code already exists
            const existingCategory = await CategoryModel.findOne({
                $or: [
                    { name: categoryData.name },
                    { code: categoryData.code },
                ],
            });

            if (existingCategory) {
                throw new ApiError(409, "Category with this name or code already exists", [], "");
            }

            const category = new CategoryModel(categoryData);
            await category.save();

            return {
                success: true,
                data: category,
                message: SUCCESS_MESSAGES.CATEGORY_CREATED,
            };
        } catch (error) {
            if (error instanceof ApiError) throw error;
            throw new ApiError(500, ERROR_MESSAGES.INTERNAL_ERROR, [], "");
        }
    }

    /**
     * Update category
     */
    static async updateCategory(id: string, updateData: any) {
        try {
            // Check for duplicate name/code if they're being updated
            if (updateData.name || updateData.code) {
                const query: any = { _id: { $ne: id } };
                const orConditions: any = [];

                if (updateData.name) orConditions.push({ name: updateData.name });
                if (updateData.code) orConditions.push({ code: updateData.code });

                if (orConditions.length > 0) {
                    query.$or = orConditions;
                    const duplicate = await CategoryModel.findOne(query);
                    if (duplicate) {
                        throw new ApiError(409, "Category with this name or code already exists", [], "");
                    }
                }
            }

            const category = await CategoryModel.findByIdAndUpdate(
                id,
                { $set: updateData },
                { new: true, runValidators: true }
            );

            if (!category) {
                throw new ApiError(404, ERROR_MESSAGES.CATEGORY_NOT_FOUND, [], "");
            }

            return {
                success: true,
                data: category,
                message: SUCCESS_MESSAGES.CATEGORY_UPDATED,
            };
        } catch (error) {
            if (error instanceof ApiError) throw error;
            throw new ApiError(500, ERROR_MESSAGES.INTERNAL_ERROR, [], "");
        }
    }

    /**
     * Delete category
     */
    static async deleteCategory(id: string) {
        try {
            const category = await CategoryModel.findByIdAndDelete(id);
            if (!category) {
                throw new ApiError(404, ERROR_MESSAGES.CATEGORY_NOT_FOUND, [], "");
            }

            return {
                success: true,
                message: SUCCESS_MESSAGES.CATEGORY_DELETED,
            };
        } catch (error) {
            if (error instanceof ApiError) throw error;
            throw new ApiError(500, ERROR_MESSAGES.INTERNAL_ERROR, [], "");
        }
    }

    /**
     * Get categories tree (hierarchical)
     */
    static async getCategoriesTree() {
        try {
            const rootCategories = await CategoryModel.find({ parent: null }).lean();

            const buildTree = async (parentId: any): Promise<any[]> => {
                const children = await CategoryModel.find({ parent: parentId }).lean();
                return Promise.all(
                    children.map(async (child: any) => ({
                        ...child,
                        children: await buildTree(child._id),
                    }))
                );
            };

            const tree = await Promise.all(
                rootCategories.map(async (cat: any) => ({
                    ...cat,
                    children: await buildTree(cat._id),
                }))
            );

            return {
                success: true,
                data: tree,
            };
        } catch (error) {
            throw new ApiError(500, ERROR_MESSAGES.INTERNAL_ERROR, [], "");
        }
    }

    /**
     * Check if category exists by name or code
     */
    static async checkCategoryExists(name?: string, code?: string) {
        try {
            const query: any = { $or: [] };

            if (name) query.$or.push({ name });
            if (code) query.$or.push({ code });

            if (query.$or.length === 0) {
                return null;
            }

            const category = await CategoryModel.findOne(query);
            return category;
        } catch (error) {
            throw new ApiError(500, ERROR_MESSAGES.INTERNAL_ERROR, [], "");
        }
    }
}
