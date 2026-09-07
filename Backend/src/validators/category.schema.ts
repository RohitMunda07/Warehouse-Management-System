import z from "zod";

/* -------------------------------------------------------------------------- */
/*                       CATEGORY SCHEMA                                    */
/* -------------------------------------------------------------------------- */

export const CreateCategorySchema = z.object({
    name: z
        .string()
        .trim()
        .min(1, { message: "Category name is required" })
        .max(100, { message: "Category name cannot exceed 100 characters" }),

    description: z
        .string()
        .trim()
        .max(500, { message: "Description cannot exceed 500 characters" })
        .optional(),

    parent: z
        .string()
        .optional()
        .nullable(),

    code: z
        .string()
        .trim()
        .toUpperCase()
        .min(1, { message: "Category code is required" })
        .max(20, { message: "Category code cannot exceed 20 characters" })
        .regex(/^[A-Z0-9_]+$/, { message: "Code must contain only uppercase letters, numbers, and underscores" }),

    icon: z
        .string()
        .trim()
        .url({ message: "Icon must be a valid URL" })
        .optional(),

    color: z
        .string()
        .trim()
        .regex(/^#[0-9A-F]{6}$/i, { message: "Color must be a valid hex color (e.g., #3B82F6)" })
        .optional(),

    isActive: z
        .boolean()
        .optional()
        .default(true),
});

export const UpdateCategorySchema = z.object({
    name: z
        .string()
        .trim()
        .min(1, { message: "Category name is required" })
        .max(100, { message: "Category name cannot exceed 100 characters" })
        .optional(),

    description: z
        .string()
        .trim()
        .max(500, { message: "Description cannot exceed 500 characters" })
        .optional()
        .nullable(),

    parent: z
        .string()
        .optional()
        .nullable(),

    code: z
        .string()
        .trim()
        .toUpperCase()
        .min(1, { message: "Category code is required" })
        .max(20, { message: "Category code cannot exceed 20 characters" })
        .regex(/^[A-Z0-9_]+$/, { message: "Code must contain only uppercase letters, numbers, and underscores" })
        .optional(),

    icon: z
        .string()
        .trim()
        .url({ message: "Icon must be a valid URL" })
        .optional()
        .nullable(),

    color: z
        .string()
        .trim()
        .regex(/^#[0-9A-F]{6}$/i, { message: "Color must be a valid hex color (e.g., #3B82F6)" })
        .optional()
        .nullable(),

    isActive: z
        .boolean()
        .optional(),
}).strict();

export const GetCategorySchema = z.object({
    id: z
        .string()
        .min(1, { message: "Category ID is required" })
        .regex(/^[0-9a-fA-F]{24}$/, { message: "Invalid MongoDB ID format" }),
});

/* -------------------------------------------------------------------------- */
/*                       TYPE EXPORTS                                       */
/* -------------------------------------------------------------------------- */

export type CreateCategoryInput = z.infer<typeof CreateCategorySchema>;
export type UpdateCategoryInput = z.infer<typeof UpdateCategorySchema>;
export type GetCategoryInput = z.infer<typeof GetCategorySchema>;
