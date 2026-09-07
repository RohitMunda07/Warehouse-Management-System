/* -------------------------------------------------------------------------- */
/*                         APPLICATION CONSTANTS                            */
/* -------------------------------------------------------------------------- */

// ==================== HTTP Status Codes ====================
export const HTTP_STATUS = {
    OK: 200,
    CREATED: 201,
    BAD_REQUEST: 400,
    UNAUTHORIZED: 401,
    FORBIDDEN: 403,
    NOT_FOUND: 404,
    CONFLICT: 409,
    UNPROCESSABLE_ENTITY: 422,
    INTERNAL_SERVER_ERROR: 500,
} as const;

// ==================== Error Messages ====================
export const ERROR_MESSAGES = {
    INVALID_CREDENTIALS: "Invalid email or password",
    USER_NOT_FOUND: "User not found",
    USER_EXISTS: "User with email, phone, or username already exists",
    ITEM_NOT_FOUND: "Item not found",
    CATEGORY_NOT_FOUND: "Category not found",
    SKU_EXISTS: "Item with this SKU already exists",
    UNAUTHORIZED: "Unauthorized access",
    VALIDATION_FAILED: "Validation failed",
    INTERNAL_ERROR: "Internal server error",
    INVALID_TOKEN: "Invalid or expired token",
    TOKENS_REQUIRED: "Both access and refresh tokens are required",
} as const;

// ==================== Success Messages ====================
export const SUCCESS_MESSAGES = {
    USER_REGISTERED: "User registered successfully",
    USER_LOGGED_IN: "User logged in successfully",
    USER_LOGGED_OUT: "User logged out successfully",
    PASSWORD_CHANGED: "Password changed successfully",
    PROFILE_UPDATED: "Profile updated successfully",
    ITEM_CREATED: "Item created successfully",
    ITEM_UPDATED: "Item updated successfully",
    ITEM_DELETED: "Item deleted successfully",
    ITEMS_FETCHED: "Items fetched successfully",
    ITEM_FETCHED: "Item fetched successfully",
    STOCK_ADJUSTED: "Stock adjusted successfully",
    CATEGORY_CREATED: "Category created successfully",
    CATEGORY_UPDATED: "Category updated successfully",
    CATEGORY_DELETED: "Category deleted successfully",
    CATEGORIES_FETCHED: "Categories fetched successfully",
} as const;

// ==================== Token Configuration ====================
export const TOKEN_CONFIG = {
    ACCESS_TOKEN_EXPIRY: "1d",
    REFRESH_TOKEN_EXPIRY: "7d",
    ACCESS_TOKEN_COOKIE_OPTS: {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict" as const,
        maxAge: 24 * 60 * 60 * 1000, // 1 day in milliseconds
    },
    REFRESH_TOKEN_COOKIE_OPTS: {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict" as const,
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days in milliseconds
    },
} as const;

// ==================== Pagination ====================
export const PAGINATION = {
    DEFAULT_PAGE: 1,
    DEFAULT_LIMIT: 10,
    MAX_LIMIT: 100,
} as const;

// ==================== User Roles & Status ====================
export const USER_ROLES = {
    USER: "user",
    ADMIN: "admin",
} as const;

export const USER_STATUS = {
    PENDING: "pending",
    ACTIVE: "active",
    SUSPENDED: "suspended",
    BLOCKED: "blocked",
} as const;

// ==================== Item Status & Stock Levels ====================
export const ITEM_STATUS = {
    ACTIVE: "active",
    INACTIVE: "inactive",
    DISCONTINUED: "discontinued",
} as const;

export const STOCK_LEVELS = {
    HEALTHY: "healthy",
    WATCH: "watch",
    REORDER: "reorder",
} as const;

export const UNIT_TYPES = {
    PIECE: "piece",
    BOX: "box",
    CARTON: "carton",
    PALLET: "pallet",
    KG: "kg",
    LITER: "liter",
    METER: "meter",
} as const;

export const WAREHOUSE_LOCATIONS = {
    AISLE_A: "aisle_a",
    AISLE_B: "aisle_b",
    AISLE_C: "aisle_c",
    COLD_STORAGE: "cold_storage",
    HAZMAT: "hazmat",
    DOCK: "dock",
    QUARANTINE: "quarantine",
} as const;

export const STOCK_MOVEMENT_TYPES = {
    INBOUND: "inbound",
    OUTBOUND: "outbound",
    ADJUSTMENT: "adjustment",
    DAMAGE: "damage",
    RETURN: "return",
} as const;

// ==================== Validation Rules ====================
export const VALIDATION_RULES = {
    USERNAME: {
        MIN_LENGTH: 3,
        MAX_LENGTH: 20,
        REGEX: /^[a-z0-9_]+$/,
    },
    PASSWORD: {
        MIN_LENGTH: 8,
    },
    FULLNAME: {
        MIN_LENGTH: 2,
        MAX_LENGTH: 30,
    },
    EMAIL_REGEX: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    PHONE_REGEX: /^(?:\+91|91)?[6-9]\d{9}$/,
    SKU: {
        MIN_LENGTH: 1,
        MAX_LENGTH: 50,
    },
} as const;

// ==================== Limits & Thresholds ====================
export const LIMITS = {
    MAX_FILE_SIZE: 20 * 1024 * 1024, // 20MB
    MAX_TEXT_LENGTH: 500,
    MAX_NAME_LENGTH: 100,
    RATE_LIMIT_WINDOW_MS: 15 * 60 * 1000, // 15 minutes
    RATE_LIMIT_MAX_REQUESTS: 100,
} as const;

// ==================== API Routes ====================
export const API_ROUTES = {
    VERSION: "/api/v1",
    USERS: "/api/v1/users",
    ITEMS: "/api/v1/items",
    CATEGORIES: "/api/v1/categories",
} as const;
