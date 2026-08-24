import z from "zod";

export const CreateItemSchema = z.object({
    sku: z
        .string()
        .trim()
        .toUpperCase()
        .min(1, { message: "SKU is required" })
        .max(50, { message: "SKU cannot exceed 50 characters" }),
    
    name: z
        .string()
        .trim()
        .min(1, { message: "Item name is required" })
        .max(100, { message: "Item name cannot exceed 100 characters" }),
    
    description: z
        .string()
        .trim()
        .max(500, { message: "Description cannot exceed 500 characters" })
        .optional(),
    
    barcode: z
        .string()
        .trim()
        .max(50, { message: "Barcode cannot exceed 50 characters" })
        .optional(),
    
    category: z
        .string()
        .trim()
        .min(1, { message: "Category is required" })
        .max(50, { message: "Category cannot exceed 50 characters" }),
    
    subcategory: z
        .string()
        .trim()
        .max(50, { message: "Subcategory cannot exceed 50 characters" })
        .optional(),
    
    quantity: z
        .number()
        .min(0, { message: "Quantity cannot be negative" })
        .int({ message: "Quantity must be a whole number" }),
    
    unit: z
        .enum(["piece", "box", "carton", "pallet", "kg", "liter", "meter"])
        .optional(),
    
    unitsPerBox: z
        .number()
        .min(0, { message: "Units per box cannot be negative" })
        .int({ message: "Units per box must be a whole number" })
        .optional(),
    
    unitCost: z
        .number()
        .positive({ message: "Unit cost must be positive" }),
    
    sellingPrice: z
        .number()
        .positive({ message: "Selling price must be positive" }),
    
    reorderThreshold: z
        .number()
        .min(0, { message: "Reorder threshold cannot be negative" })
        .int({ message: "Reorder threshold must be a whole number" }),
    
    maxStock: z
        .number()
        .positive({ message: "Max stock must be positive" })
        .int({ message: "Max stock must be a whole number" }),
    
    safetyStock: z
        .number()
        .min(0, { message: "Safety stock cannot be negative" })
        .int({ message: "Safety stock must be a whole number" })
        .optional(),
    
    leadTimeDays: z
        .number()
        .min(0, { message: "Lead time cannot be negative" })
        .int({ message: "Lead time must be a whole number" })
        .optional(),
    
    supplier: z
        .string()
        .trim()
        .max(100, { message: "Supplier name cannot exceed 100 characters" })
        .optional(),
    
    supplierSku: z
        .string()
        .trim()
        .max(50, { message: "Supplier SKU cannot exceed 50 characters" })
        .optional(),
    
    supplierLeadTime: z
        .number()
        .min(0, { message: "Supplier lead time cannot be negative" })
        .optional(),
    
    batchNumber: z
        .string()
        .trim()
        .max(50, { message: "Batch number cannot exceed 50 characters" })
        .optional(),
    
    lotNumber: z
        .string()
        .trim()
        .max(50, { message: "Lot number cannot exceed 50 characters" })
        .optional(),
    
    expiryDate: z
        .string()
        .datetime()
        .optional()
        .refine(
            (date) => !date || new Date(date) > new Date(),
            { message: "Expiry date must be in the future" }
        ),
    
    manufacturedDate: z
        .string()
        .datetime()
        .optional(),
    
    weight: z
        .number()
        .min(0, { message: "Weight cannot be negative" })
        .optional(),
    
    dimensions: z
        .object({
            length: z.number().min(0, { message: "Length cannot be negative" }),
            width: z.number().min(0, { message: "Width cannot be negative" }),
            height: z.number().min(0, { message: "Height cannot be negative" })
        })
        .optional(),
    
    volume: z
        .number()
        .min(0, { message: "Volume cannot be negative" })
        .optional(),
    
    status: z
        .enum(["active", "inactive", "discontinued"])
        .optional(),
    
    isFragile: z
        .boolean()
        .optional(),
    
    requiresRefrigeration: z
        .boolean()
        .optional(),
    
    tags: z
        .array(z.string())
        .optional(),
    
    notes: z
        .string()
        .trim()
        .max(500, { message: "Notes cannot exceed 500 characters" })
        .optional(),
    
    lastRestocked: z
        .string()
        .datetime()
        .optional()
});

export const UpdateItemSchema = CreateItemSchema.partial();

export const GetItemSchema = z.object({
    id: z.string().min(1, { message: "Item ID is required" })
});

export const DeleteItemSchema = z.object({
    id: z.string().min(1, { message: "Item ID is required" })
});

export const AdjustStockSchema = z.object({
    quantity: z
        .number({ message: "Quantity must be a number" })
        .int({ message: "Quantity must be a whole number" }),
    
    reason: z
        .string()
        .trim()
        .min(1, { message: "Reason is required" })
        .max(200, { message: "Reason cannot exceed 200 characters" }),
    
    reference: z
        .string()
        .trim()
        .max(100, { message: "Reference cannot exceed 100 characters" })
        .optional(),
    
    type: z
        .enum(["inbound", "outbound", "adjustment", "damage", "return"])
        .optional()
});

