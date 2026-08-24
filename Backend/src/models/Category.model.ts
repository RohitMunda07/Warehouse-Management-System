import mongoose, { Schema, Document } from "mongoose";

/* -------------------------------------------------------------------------- */
/*                              INTERFACE                                     */
/* -------------------------------------------------------------------------- */

export interface CategoryDocument extends Document {
    name: string;
    description?: string;
    parent?: mongoose.Types.ObjectId; // For hierarchical categories
    code: string; // Unique identifier like "ELECT", "FURN", etc.
    icon?: string; // URL to category icon
    color?: string; // Hex color for UI
    isActive: boolean;
    itemCount?: number; // Denormalized count
    createdAt: Date;
    updatedAt: Date;
}

/* -------------------------------------------------------------------------- */
/*                              SCHEMA                                        */
/* -------------------------------------------------------------------------- */

const categorySchema = new Schema<CategoryDocument>(
    {
        name: {
            type: String,
            required: [true, "Category name is required"],
            trim: true,
            unique: true,
            index: true
        },
        description: {
            type: String,
            trim: true
        },
        parent: {
            type: Schema.Types.ObjectId,
            ref: "Category",
            default: null
        },
        code: {
            type: String,
            required: [true, "Category code is required"],
            unique: true,
            trim: true,
            uppercase: true,
            match: [/^[A-Z0-9_]+$/, "Code must contain only uppercase letters, numbers, and underscores"]
        },
        icon: {
            type: String,
            trim: true
        },
        color: {
            type: String,
            match: [/^#[0-9A-F]{6}$/i, "Color must be a valid hex color"],
            default: "#3B82F6"
        },
        isActive: {
            type: Boolean,
            default: true,
            index: true
        },
        itemCount: {
            type: Number,
            default: 0,
            min: 0
        }
    },
    {
        timestamps: true,
        collection: "categories"
    }
);

/* -------------------------------------------------------------------------- */
/*                              INDEXES                                       */
/* -------------------------------------------------------------------------- */

categorySchema.index({ code: 1, isActive: 1 });
categorySchema.index({ parent: 1 });

/* -------------------------------------------------------------------------- */
/*                              MODEL                                         */
/* -------------------------------------------------------------------------- */

export const CategoryModel = mongoose.model<CategoryDocument>(
    "Category",
    categorySchema
);
