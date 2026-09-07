import { Request, Response } from "express";
import { UserDocument } from "../models/User.model.js";

/* -------------------------------------------------------------------------- */
/*                        CUSTOM REQUEST TYPES                              */
/* -------------------------------------------------------------------------- */

export interface AuthenticatedRequest extends Request {
    user?: UserDocument;
}

/* -------------------------------------------------------------------------- */
/*                        API RESPONSE TYPES                                */
/* -------------------------------------------------------------------------- */

export interface ApiResponsePayload<T = any> {
    statusCode: number;
    data: T;
    message: string;
    success: boolean;
}

export interface PaginatedResponse<T = any> {
    data: T[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        pages: number;
    };
}

export interface ApiErrorPayload {
    statusCode: number;
    message: string;
    errors: any[];
    stack?: string;
}

/* -------------------------------------------------------------------------- */
/*                        VALIDATION TYPES                                  */
/* -------------------------------------------------------------------------- */

export interface ValidationError {
    field: string;
    message: string;
    code?: string;
}

export interface ValidationResult<T = any> {
    success: boolean;
    data?: T;
    errors?: ValidationError[];
}

/* -------------------------------------------------------------------------- */
/*                        GENERIC SERVICE TYPES                             */
/* -------------------------------------------------------------------------- */

export interface FindOptions {
    skip?: number;
    limit?: number;
    sort?: Record<string, 1 | -1>;
    select?: string[];
}

export interface CreateResult<T = any> {
    success: boolean;
    data?: T;
    error?: string;
}

export interface UpdateResult<T = any> {
    success: boolean;
    data?: T;
    error?: string;
}

export interface DeleteResult {
    success: boolean;
    deletedCount: number;
    error?: string;
}

/* -------------------------------------------------------------------------- */
/*                        QUERY FILTER TYPES                                */
/* -------------------------------------------------------------------------- */

export interface ItemFilter {
    status?: "active" | "inactive" | "discontinued";
    category?: string;
    subcategory?: string;
    supplier?: string;
    tags?: string[];
    isLowStock?: boolean;
    search?: string;
}

export interface UserFilter {
    status?: "active" | "suspended" | "blocked";
    role?: "user" | "admin";
    search?: string;
}

export interface CategoryFilter {
    isActive?: boolean;
    parent?: string;
    search?: string;
}

/* -------------------------------------------------------------------------- */
/*                        STOCK MANAGEMENT TYPES                            */
/* -------------------------------------------------------------------------- */

export interface StockAdjustmentPayload {
    quantity: number;
    type: "inbound" | "outbound" | "adjustment" | "damage" | "return";
    reason: string;
    reference?: string;
    location?: string;
}

export interface StockMovementData {
    type: string;
    quantity: number;
    reason: string;
    reference?: string;
    movedAt: Date;
    movedBy?: string;
}

/* -------------------------------------------------------------------------- */
/*                        ANALYTICS TYPES                                   */
/* -------------------------------------------------------------------------- */

export interface InventoryStats {
    totalItems: number;
    totalValue: number;
    lowStockCount: number;
    avgTurnoverRate: number;
    lastUpdated: Date;
}

export interface CategoryStats {
    categoryId: string;
    categoryName: string;
    itemCount: number;
    totalValue: number;
}

export interface WarehouseAnalytics {
    totalQuantity: number;
    locationBreakdown: Record<string, number>;
    topMovedItems: any[];
    reorderNeededCount: number;
}

/* -------------------------------------------------------------------------- */
/*                        DATABASE OPERATION TYPES                          */
/* -------------------------------------------------------------------------- */

export interface BulkOperationResult {
    success: number;
    failed: number;
    errors?: Array<{ index: number; error: string }>;
}

export interface AuditLog {
    userId: string;
    action: string;
    entityType: string;
    entityId: string;
    changes: Record<string, any>;
    timestamp: Date;
}

/* -------------------------------------------------------------------------- */
/*                        ERROR TYPES                                       */
/* -------------------------------------------------------------------------- */

export type ErrorCode =
    | "VALIDATION_ERROR"
    | "NOT_FOUND"
    | "UNAUTHORIZED"
    | "FORBIDDEN"
    | "CONFLICT"
    | "INTERNAL_ERROR"
    | "BAD_REQUEST";

/* -------------------------------------------------------------------------- */
/*                        MIDDLEWARE TYPES                                  */
/* -------------------------------------------------------------------------- */

export interface RateLimitInfo {
    attempts: number;
    firstAttempt: Date;
    isBlocked: boolean;
}

export interface JwtPayload {
    _id: string;
    email?: string;
    iat?: number;
    exp?: number;
}
