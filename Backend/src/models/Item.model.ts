import mongoose, { Schema, Document } from "mongoose";

/* -------------------------------------------------------------------------- */
/*                              ENUMS                                         */
/* -------------------------------------------------------------------------- */

export enum ItemStatus {
    ACTIVE = "active",
    INACTIVE = "inactive",
    DISCONTINUED = "discontinued"
}

export enum StockLevel {
    HEALTHY = "healthy",
    WATCH = "watch",
    REORDER = "reorder"
}

export enum UnitType {
    PIECE = "piece",
    BOX = "box",
    CARTON = "carton",
    PALLET = "pallet",
    KG = "kg",
    LITER = "liter",
    METER = "meter"
}

export enum WarehouseLocation {
    AISLE_A = "aisle_a",
    AISLE_B = "aisle_b",
    AISLE_C = "aisle_c",
    COLD_STORAGE = "cold_storage",
    HAZMAT = "hazmat",
    DOCK = "dock",
    QUARANTINE = "quarantine"
}

/* -------------------------------------------------------------------------- */
/*                          SUB-INTERFACES                                    */
/* -------------------------------------------------------------------------- */

export interface WarehouseStock {
    location: WarehouseLocation;
    quantity: number;
    binNumber?: string;
}

export interface StockMovement {
    type: "inbound" | "outbound" | "adjustment" | "damage" | "return";
    quantity: number;
    reason: string;
    reference?: string; // PO number, SO number, etc.
    movedAt: Date;
    movedBy?: string; // User ID
}

export interface PricingTier {
    minQuantity: number;
    unitPrice: number;
}

/* -------------------------------------------------------------------------- */
/*                              INTERFACE                                     */
/* -------------------------------------------------------------------------- */

export interface ItemDocument extends Document {
    // Basic Info
    sku: string;
    name: string;
    description?: string;
    barcode?: string;
    category: string;
    subcategory?: string;

    // Quantity & Units
    quantity: number;
    unit: UnitType;
    unitsPerBox?: number; // For multi-level stocking

    // Warehouse Locations
    warehouseStocks: WarehouseStock[];

    // Pricing
    unitCost: number;
    sellingPrice: number;
    pricingTiers?: PricingTier[];

    // Stock Management
    reorderThreshold: number;
    maxStock: number;
    safetyStock: number; // Minimum to keep for emergencies
    leadTimeDays?: number; // Supplier lead time

    // Supplier Info
    supplier?: string;
    supplierSku?: string;
    supplierLeadTime?: number;

    // Tracking
    batchNumber?: string;
    lotNumber?: string;
    expiryDate?: Date;
    manufacturedDate?: Date;

    // Dimensions & Weight (for warehouse optimization)
    weight?: number; // kg
    dimensions?: {
        length: number;
        width: number;
        height: number;
    };
    volume?: number; // cubic meters

    // Status & Tracking
    status: ItemStatus;
    lastRestocked?: Date;
    lastAuditDate?: Date;
    stockMovements: StockMovement[];

    // Metadata
    tags?: string[];
    notes?: string;
    isFragile?: boolean;
    requiresRefrigeration?: boolean;

    createdAt: Date;
    updatedAt: Date;
}

/* -------------------------------------------------------------------------- */
/*                              SCHEMA                                        */
/* -------------------------------------------------------------------------- */

const warehouseStockSchema = new Schema<WarehouseStock>(
    {
        location: {
            type: String,
            enum: Object.values(WarehouseLocation),
            required: true
        },
        quantity: {
            type: Number,
            required: true,
            default: 0,
            min: [0, "Quantity cannot be negative"]
        },
        binNumber: {
            type: String,
            trim: true
        }
    },
    { _id: false }
);

const stockMovementSchema = new Schema<StockMovement>(
    {
        type: {
            type: String,
            enum: ["inbound", "outbound", "adjustment", "damage", "return"],
            required: true
        },
        quantity: {
            type: Number,
            required: true,
            min: [0, "Quantity cannot be negative"]
        },
        reason: {
            type: String,
            required: true,
            trim: true
        },
        reference: {
            type: String,
            trim: true
        },
        movedAt: {
            type: Date,
            required: true,
            default: Date.now
        },
        movedBy: {
            type: String,
            trim: true
        }
    },
    { _id: false }
);

const pricingTierSchema = new Schema<PricingTier>(
    {
        minQuantity: {
            type: Number,
            required: true,
            min: [0, "Min quantity cannot be negative"]
        },
        unitPrice: {
            type: Number,
            required: true,
            min: [0, "Price cannot be negative"]
        }
    },
    { _id: false }
);

const dimensionsSchema = new Schema(
    {
        length: {
            type: Number,
            required: true,
            min: [0, "Length cannot be negative"]
        },
        width: {
            type: Number,
            required: true,
            min: [0, "Width cannot be negative"]
        },
        height: {
            type: Number,
            required: true,
            min: [0, "Height cannot be negative"]
        }
    },
    { _id: false }
);

const itemSchema = new Schema<ItemDocument>(
    {
        // Basic Info
        sku: {
            type: String,
            required: [true, "SKU is required"],
            unique: true,
            trim: true,
            uppercase: true,
            index: true
        },
        name: {
            type: String,
            required: [true, "Item name is required"],
            trim: true,
            index: true
        },
        description: {
            type: String,
            trim: true
        },
        barcode: {
            type: String,
            trim: true,
            sparse: true,
            unique: true
        },
        category: {
            type: String,
            required: [true, "Category is required"],
            trim: true,
            index: true
        },
        subcategory: {
            type: String,
            trim: true
        },

        // Quantity & Units
        quantity: {
            type: Number,
            required: [true, "Quantity is required"],
            default: 0,
            min: [0, "Quantity cannot be negative"],
            index: true
        },
        unit: {
            type: String,
            enum: Object.values(UnitType),
            default: UnitType.PIECE
        },
        unitsPerBox: {
            type: Number,
            min: [0, "Units per box cannot be negative"]
        },

        // Warehouse Locations
        warehouseStocks: {
            type: [warehouseStockSchema],
            default: []
        },

        // Pricing
        unitCost: {
            type: Number,
            required: [true, "Unit cost is required"],
            min: [0, "Unit cost cannot be negative"]
        },
        sellingPrice: {
            type: Number,
            required: [true, "Selling price is required"],
            min: [0, "Selling price cannot be negative"]
        },
        pricingTiers: {
            type: [pricingTierSchema],
            default: []
        },

        // Stock Management
        reorderThreshold: {
            type: Number,
            required: [true, "Reorder threshold is required"],
            min: [0, "Reorder threshold cannot be negative"]
        },
        maxStock: {
            type: Number,
            required: [true, "Max stock is required"],
            min: [0, "Max stock cannot be negative"]
        },
        safetyStock: {
            type: Number,
            default: 0,
            min: [0, "Safety stock cannot be negative"]
        },
        leadTimeDays: {
            type: Number,
            min: [0, "Lead time cannot be negative"]
        },

        // Supplier Info
        supplier: {
            type: String,
            trim: true
        },
        supplierSku: {
            type: String,
            trim: true
        },
        supplierLeadTime: {
            type: Number,
            min: [0, "Supplier lead time cannot be negative"]
        },

        // Tracking
        batchNumber: {
            type: String,
            trim: true
        },
        lotNumber: {
            type: String,
            trim: true
        },
        expiryDate: {
            type: Date
        },
        manufacturedDate: {
            type: Date
        },

        // Dimensions & Weight
        weight: {
            type: Number,
            min: [0, "Weight cannot be negative"]
        },
        dimensions: {
            type: dimensionsSchema
        },
        volume: {
            type: Number,
            min: [0, "Volume cannot be negative"]
        },

        // Status & Tracking
        status: {
            type: String,
            enum: Object.values(ItemStatus),
            default: ItemStatus.ACTIVE,
            index: true
        },
        lastRestocked: {
            type: Date
        },
        lastAuditDate: {
            type: Date
        },
        stockMovements: {
            type: [stockMovementSchema],
            default: []
        },

        // Metadata
        tags: {
            type: [String],
            default: []
        },
        notes: {
            type: String,
            trim: true
        },
        isFragile: {
            type: Boolean,
            default: false
        },
        requiresRefrigeration: {
            type: Boolean,
            default: false
        }
    },
    {
        timestamps: true,
        collection: "items"
    }
);

/* -------------------------------------------------------------------------- */
/*                              INDEXES                                       */
/* -------------------------------------------------------------------------- */

// Compound indexes for common queries
itemSchema.index({ category: 1, status: 1 });
itemSchema.index({ quantity: 1, reorderThreshold: 1 });
itemSchema.index({ supplier: 1, status: 1 });
itemSchema.index({ createdAt: -1 });

/* -------------------------------------------------------------------------- */
/*                              METHODS                                       */
/* -------------------------------------------------------------------------- */

itemSchema.methods.getStockLevel = function (this: ItemDocument): StockLevel {
    if (this.quantity <= this.reorderThreshold) {
        return StockLevel.REORDER;
    }
    if (this.quantity <= this.reorderThreshold * 1.5) {
        return StockLevel.WATCH;
    }
    return StockLevel.HEALTHY;
};

itemSchema.methods.isLowOnStock = function (this: ItemDocument): boolean {
    return this.quantity <= this.reorderThreshold;
};

itemSchema.methods.addStockMovement = function (
    this: ItemDocument,
    movement: StockMovement
): void {
    this.stockMovements.push(movement);
};

/* -------------------------------------------------------------------------- */
/*                              MODEL                                         */
/* -------------------------------------------------------------------------- */

export const ItemModel = mongoose.model<ItemDocument>("Item", itemSchema);

