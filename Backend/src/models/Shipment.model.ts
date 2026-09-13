import mongoose, { Schema, Document } from "mongoose";

export enum ShipmentStatus {
    PACKED = "Packed",
    IN_TRANSIT = "In Transit",
    DELIVERED = "Delivered",
    DELAYED = "Delayed"
}

export interface ShipmentDocument extends Document {
    itemName: string;
    sku: string;
    customer: string;
    destination: string;
    quantity: number;
    status: ShipmentStatus;
    shipmentDate: Date;
    tracking: string;
    notes?: string;
    createdAt: Date;
    updatedAt: Date;
}

const ShipmentSchema = new Schema<ShipmentDocument>(
    {
        itemName: {
            type: String,
            required: [true, "Item name is required"],
            trim: true,
            index: true
        },
        sku: {
            type: String,
            trim: true,
            default: ""
        },
        customer: {
            type: String,
            required: [true, "Customer is required"],
            trim: true,
            index: true
        },
        destination: {
            type: String,
            required: [true, "Destination is required"],
            trim: true,
            index: true
        },
        quantity: {
            type: Number,
            required: [true, "Quantity is required"],
            min: [1, "Quantity must be at least 1"],
            default: 1
        },
        status: {
            type: String,
            enum: Object.values(ShipmentStatus),
            default: ShipmentStatus.PACKED
        },
        shipmentDate: {
            type: Date,
            required: [true, "Shipment date is required"],
            default: Date.now
        },
        tracking: {
            type: String,
            trim: true,
            default: ""
        },
        notes: {
            type: String,
            trim: true,
            default: ""
        }
    },
    {
        timestamps: true,
        versionKey: false
    }
);

export const ShipmentModel = mongoose.model<ShipmentDocument>("Shipment", ShipmentSchema);
