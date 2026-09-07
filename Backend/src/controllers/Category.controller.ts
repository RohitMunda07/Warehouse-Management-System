import { asyncHandler } from "../utils/asyncHandler.js";
import ApiResponse from "../utils/apiResponse.js";
import ApiError from "../utils/apiError.js";
import { CategoryService } from "../services/Category.service.js";
import {
    CreateCategorySchema,
    UpdateCategorySchema,
    GetCategorySchema,
} from "../validators/category.schema";
import { HTTP_STATUS, SUCCESS_MESSAGES } from "../constants/index.js";

/* -------------------------------------------------------------------------- */
/*                        GET ALL CATEGORIES                                */
/* -------------------------------------------------------------------------- */

export const getAllCategories = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, isActive } = req.query;

    const filter: any = {};
    if (isActive !== undefined) {
        filter.isActive = isActive === "true";
    }

    const options = {
        skip: (Number(page) - 1) * Number(limit),
        limit: Number(limit),
        sort: { createdAt: -1 as const } as Record<string, 1 | -1>,
    };

    const result = await CategoryService.getAllCategories(filter, options);

    return res.status(HTTP_STATUS.OK).json(
        new ApiResponse(
            HTTP_STATUS.OK,
            result.data,
            SUCCESS_MESSAGES.CATEGORIES_FETCHED
        )
    );
});

/* -------------------------------------------------------------------------- */
/*                        GET CATEGORY BY ID                                */
/* -------------------------------------------------------------------------- */

export const getCategoryById = asyncHandler(async (req, res) => {
    const { id } = req.params as { id: string };

    const validation = GetCategorySchema.safeParse({ id });
    if (!validation.success) {
        throw new ApiError(
            400,
            "Invalid category ID",
            validation.error.issues,
            ""
        );
    }

    const result = await CategoryService.getCategoryById(id);

    return res.status(HTTP_STATUS.OK).json(
        new ApiResponse(
            HTTP_STATUS.OK,
            result.data,
            "Category fetched successfully"
        )
    );
});

/* -------------------------------------------------------------------------- */
/*                        CREATE CATEGORY                                   */
/* -------------------------------------------------------------------------- */

export const createCategory = asyncHandler(async (req, res) => {
    const validation = CreateCategorySchema.safeParse(req.body);
    if (!validation.success) {
        throw new ApiError(
            400,
            "Validation failed",
            validation.error.issues,
            ""
        );
    }

    const result = await CategoryService.createCategory(validation.data);

    return res.status(HTTP_STATUS.CREATED).json(
        new ApiResponse(
            HTTP_STATUS.CREATED,
            result.data,
            SUCCESS_MESSAGES.CATEGORY_CREATED
        )
    );
});

/* -------------------------------------------------------------------------- */
/*                        UPDATE CATEGORY                                   */
/* -------------------------------------------------------------------------- */

export const updateCategory = asyncHandler(async (req, res) => {
    const { id } = req.params as { id: string };

    const idValidation = GetCategorySchema.safeParse({ id });
    if (!idValidation.success) {
        throw new ApiError(
            400,
            "Invalid category ID",
            idValidation.error.issues,
            ""
        );
    }

    const dataValidation = UpdateCategorySchema.safeParse(req.body);
    if (!dataValidation.success) {
        throw new ApiError(
            400,
            "Validation failed",
            dataValidation.error.issues,
            ""
        );
    }

    const result = await CategoryService.updateCategory(id, dataValidation.data);

    return res.status(HTTP_STATUS.OK).json(
        new ApiResponse(
            HTTP_STATUS.OK,
            result.data,
            SUCCESS_MESSAGES.CATEGORY_UPDATED
        )
    );
});

/* -------------------------------------------------------------------------- */
/*                        DELETE CATEGORY                                   */
/* -------------------------------------------------------------------------- */

export const deleteCategory = asyncHandler(async (req, res) => {
    const { id } = req.params as { id: string };

    const validation = GetCategorySchema.safeParse({ id });
    if (!validation.success) {
        throw new ApiError(
            400,
            "Invalid category ID",
            validation.error.issues,
            ""
        );
    }

    await CategoryService.deleteCategory(id);

    return res.status(HTTP_STATUS.OK).json(
        new ApiResponse(
            HTTP_STATUS.OK,
            null,
            SUCCESS_MESSAGES.CATEGORY_DELETED
        )
    );
});

/* -------------------------------------------------------------------------- */
/*                        GET CATEGORIES TREE                               */
/* -------------------------------------------------------------------------- */

export const getCategoriesTree = asyncHandler(async (req, res) => {
    const result = await CategoryService.getCategoriesTree();

    return res.status(HTTP_STATUS.OK).json(
        new ApiResponse(
            HTTP_STATUS.OK,
            result.data,
            "Categories tree fetched successfully"
        )
    );
});
