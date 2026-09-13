import { asyncHandler } from "../utils/asyncHandler.js";
import ApiError from "../utils/apiError.js";
import ApiResponse from "../utils/apiResponse.js";
import { ShipmentModel, ShipmentStatus } from "../models/Shipment.model.js";
import z from "zod";

const shipmentSchema = z.object({
    itemName: z.string().trim().min(1, "Item name is required"),
    sku: z.string().trim().optional().default(""),
    customer: z.string().trim().min(1, "Customer is required"),
    destination: z.string().trim().min(1, "Destination is required"),
    quantity: z.coerce.number().min(1, "Quantity must be at least 1"),
    status: z.enum(["Packed", "In Transit", "Delivered", "Delayed"]).optional().default("Packed"),
    shipmentDate: z.coerce.date().optional(),
    tracking: z.string().trim().optional().default(""),
    notes: z.string().trim().optional().default("")
});

export const getAllShipments = asyncHandler(async (req, res) => {
    const shipments = await ShipmentModel.find().sort({ createdAt: -1 }).lean();

    return res.status(200).json(
        new ApiResponse(200, shipments, "Shipment records fetched successfully")
    );
});

export const createShipment = asyncHandler(async (req, res) => {
    const parsed = shipmentSchema.safeParse(req.body);

    if (!parsed.success) {
        throw new ApiError(400, parsed.error.issues[0]?.message || "Validation failed", [], "");
    }

    const payload = {
        ...parsed.data,
        sku: parsed.data.sku || `SHIP-${Date.now().toString().slice(-6)}`,
        tracking: parsed.data.tracking || `TRK-${Math.random().toString(36).slice(2, 8).toUpperCase()}`,
        shipmentDate: parsed.data.shipmentDate || new Date(),
        status: parsed.data.status as ShipmentStatus,
    };

    const shipment = await ShipmentModel.create(payload);

    return res.status(201).json(
        new ApiResponse(201, shipment, "Shipment record created successfully")
    );
});

export const getShipmentById = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const shipment = await ShipmentModel.findById(id);
    if (!shipment) {
        throw new ApiError(404, "Shipment not found", [], "");
    }

    return res.status(200).json(
        new ApiResponse(200, shipment, "Shipment fetched successfully")
    );
});

export const updateShipment = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const parsed = shipmentSchema.partial().safeParse(req.body);

    if (!parsed.success) {
        throw new ApiError(400, parsed.error.issues[0]?.message || "Validation failed", [], "");
    }

    const shipment = await ShipmentModel.findByIdAndUpdate(
        id,
        { $set: parsed.data },
        { new: true, runValidators: true }
    );

    if (!shipment) {
        throw new ApiError(404, "Shipment not found", [], "");
    }

    return res.status(200).json(
        new ApiResponse(200, shipment, "Shipment updated successfully")
    );
});

export const deleteShipment = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const shipment = await ShipmentModel.findByIdAndDelete(id);
    if (!shipment) {
        throw new ApiError(404, "Shipment not found", [], "");
    }

    return res.status(200).json(
        new ApiResponse(200, null, "Shipment deleted successfully")
    );
});
