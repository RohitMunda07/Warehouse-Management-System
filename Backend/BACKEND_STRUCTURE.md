# Backend Structure Refactoring - Complete Guide

## Overview
This document details the comprehensive restructuring of the waretrack-react backend for improved maintainability, consistency, and scalability.

---

## 📁 New Folder Structure

### Constants (`src/constants/index.ts`)
Centralized configuration and constants to avoid magic strings throughout the codebase.

**Contents:**
- HTTP status codes
- Error/success messages
- Token configuration
- User roles and statuses
- Item and warehouse enums
- Validation rules
- API route definitions

**Benefits:**
- Single source of truth for magic values
- Easy to maintain and update
- Type-safe with TypeScript

### Shared Interfaces (`src/interfaces/index.ts`)
TypeScript interfaces and types used across the application.

**Key Types:**
- `AuthenticatedRequest` - Express Request with user
- `ApiResponsePayload<T>` - Standard API response
- `ApiErrorPayload` - Error response format
- `FindOptions` - Database query options
- Multiple filter types (ItemFilter, UserFilter, CategoryFilter)
- Result types for CRUD operations

### Service Layer (`src/services/`)
Business logic layer providing reusable methods for data operations.

#### Item.service.ts
```typescript
// Static methods for item operations
ItemService.getAllItems(filter, options)
ItemService.getItemById(id)
ItemService.createItem(itemData)
ItemService.updateItem(id, updateData)
ItemService.deleteItem(id)
ItemService.adjustStock(id, adjustment)
ItemService.getLowStockItems()
ItemService.getInventoryValue()
ItemService.getCategoryStats()
ItemService.searchItems(query)
ItemService.getWarehouseAnalytics()
```

#### User.service.ts
```typescript
UserService.getUserByEmail(email)
UserService.getUserById(id)
UserService.getAllUsers(filter, options)
UserService.updateUserProfile(id, updateData)
UserService.checkUserExists(email?, phone?, username?)
UserService.verifyPassword(user, password)
```

#### Category.service.ts
```typescript
CategoryService.getAllCategories(filter, options)
CategoryService.getCategoryById(id)
CategoryService.createCategory(categoryData)
CategoryService.updateCategory(id, updateData)
CategoryService.deleteCategory(id)
CategoryService.getCategoriesTree()
CategoryService.checkCategoryExists(name?, code?)
```

---

## 🛣️ API Routes

### Route Base Paths
```
/api/v1/users     - User management
/api/v1/items     - Inventory management
/api/v1/categories - Category management
/health           - Health check
```

### User Endpoints
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | /api/v1/users/register | ❌ | Register new user |
| POST | /api/v1/users/login | ❌ | Login user |
| POST | /api/v1/users/logout | ✅ | Logout user |
| POST | /api/v1/users/refresh-token | ❌ | Refresh access token |
| POST | /api/v1/users/change-password | ✅ | Change password |
| GET | /api/v1/users/me | ✅ | Get current user |
| PATCH | /api/v1/users/me | ✅ | Update profile |
| GET | /api/v1/users | ✅ | List all users |

### Item Endpoints
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | /api/v1/items | ❌ | List items |
| GET | /api/v1/items/:id | ❌ | Get item details |
| POST | /api/v1/items | ✅ | Create item |
| PUT | /api/v1/items/:id | ✅ | Update item |
| DELETE | /api/v1/items/:id | ✅ | Delete item |
| POST | /api/v1/items/:id/adjust-stock | ✅ | Adjust stock |
| GET | /api/v1/items/search | ❌ | Search items |
| GET | /api/v1/items/stock/low-stock | ❌ | Get low stock items |
| GET | /api/v1/items/analytics/inventory-value | ❌ | Inventory value |
| GET | /api/v1/items/analytics/category | ❌ | Category stats |
| GET | /api/v1/items/analytics/warehouse | ❌ | Warehouse analytics |

### Category Endpoints
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | /api/v1/categories | ❌ | List categories |
| GET | /api/v1/categories/tree | ❌ | Hierarchical categories |
| GET | /api/v1/categories/:id | ❌ | Get category |
| POST | /api/v1/categories | ✅ | Create category |
| PUT | /api/v1/categories/:id | ✅ | Update category |
| DELETE | /api/v1/categories/:id | ✅ | Delete category |

---

## 📝 Validators

### Item Validation
**CreateItemSchema** - Used for POST requests
- sku (required, 1-50 chars, uppercase)
- name (required, 1-100 chars)
- description (optional, max 500 chars)
- quantity (required, non-negative integer)
- unitCost (required, positive)
- sellingPrice (required, positive)
- reorderThreshold (required, non-negative)
- maxStock (required, positive)
- And more optional fields...

**UpdateItemSchema** - Partial version for PATCH requests

**AdjustStockSchema** - For stock adjustments
- quantity (required, positive)
- type (required, one of: inbound/outbound/adjustment/damage/return)
- reason (required, 1-200 chars)
- reference (optional)
- location (optional)

### Category Validation
**CreateCategorySchema**
- name (required, 1-100 chars)
- code (required, 1-20 chars, uppercase + numbers + underscores)
- description (optional, max 500 chars)
- parent (optional, for hierarchical categories)
- color (optional, hex format)
- icon (optional, valid URL)

**UpdateCategorySchema** - Partial version

### User Validation
**UserZodSchema**
- fullname (2-30 chars)
- username (3-20 chars, lowercase alphanumeric + underscore)
- email (valid email format)
- password (8+ chars)
- phone (valid Indian format)

**LoginZodSchema** - Partial schema for login

**PasswordChangeSchema** - For password changes

---

## 🔄 Request/Response Format

### Standard Success Response
```json
{
  "statusCode": 200,
  "data": { /* response data */ },
  "message": "Operation successful",
  "success": true
}
```

### Standard Error Response
```json
{
  "statusCode": 400,
  "message": "Error message",
  "errors": [ /* validation errors */ ],
  "success": false
}
```

### Paginated Response
```json
{
  "statusCode": 200,
  "data": [ /* array of items */ ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 100,
    "pages": 10
  },
  "message": "Items fetched successfully"
}
```

---

## 🔐 Constants Reference

### HTTP Status Codes
```typescript
HTTP_STATUS.OK              // 200
HTTP_STATUS.CREATED         // 201
HTTP_STATUS.BAD_REQUEST     // 400
HTTP_STATUS.UNAUTHORIZED    // 401
HTTP_STATUS.FORBIDDEN       // 403
HTTP_STATUS.NOT_FOUND       // 404
HTTP_STATUS.CONFLICT        // 409
HTTP_STATUS.INTERNAL_SERVER_ERROR  // 500
```

### User Roles
```typescript
USER_ROLES.USER   // "user"
USER_ROLES.ADMIN  // "admin"
```

### Item Status
```typescript
ITEM_STATUS.ACTIVE          // "active"
ITEM_STATUS.INACTIVE        // "inactive"
ITEM_STATUS.DISCONTINUED    // "discontinued"
```

### Stock Levels
```typescript
STOCK_LEVELS.HEALTHY  // "healthy"
STOCK_LEVELS.WATCH    // "watch"
STOCK_LEVELS.REORDER  // "reorder"
```

### Stock Movement Types
```typescript
STOCK_MOVEMENT_TYPES.INBOUND      // "inbound"
STOCK_MOVEMENT_TYPES.OUTBOUND     // "outbound"
STOCK_MOVEMENT_TYPES.ADJUSTMENT   // "adjustment"
STOCK_MOVEMENT_TYPES.DAMAGE       // "damage"
STOCK_MOVEMENT_TYPES.RETURN       // "return"
```

---

## 🎯 Design Patterns

### Service Layer Pattern
Services contain business logic and database operations:
```typescript
// In service
static async createItem(itemData) {
  // Validation
  // Duplicate checks
  // Database operations
  // Error handling
  return result;
}

// In controller
const result = await ItemService.createItem(validatedData);
res.json(new ApiResponse(201, result.data, result.message));
```

### Error Handling
Uses centralized `ApiError` class:
```typescript
throw new ApiError(
  statusCode,
  message,
  errors,
  errorCode
);
```

### Async Handler
Wraps controllers to handle Promise rejections:
```typescript
export const myController = asyncHandler(async (req, res) => {
  // No try-catch needed, errors are caught automatically
});
```

---

## 📊 Data Models

### Item Model
- Core fields: sku, name, description, barcode
- Inventory: quantity, unit, warehouseStocks
- Pricing: unitCost, sellingPrice, pricingTiers
- Reordering: reorderThreshold, safetyStock, leadTimeDays
- Tracking: batchNumber, lotNumber, expiryDate
- Audit: createdAt, updatedAt, stockMovements

### User Model
- Profile: fullname, username, email, phone
- Avatar: url, publicId
- Company info: company, designation, website, bio
- Security: password, refreshToken
- Status: role, status, isVerified, isActive

### Category Model
- name (unique)
- code (unique, uppercase)
- parent (for hierarchies)
- Visuals: icon, color
- Meta: isActive, itemCount, timestamps

---

## 🚀 Usage Examples

### Getting All Items With Filtering
```typescript
const filter = {
  status: "active",
  category: "Electronics",
  isLowStock: true
};

const options = {
  skip: 0,
  limit: 20,
  sort: { createdAt: -1 }
};

const result = await ItemService.getAllItems(filter, options);
```

### Creating a Category
```typescript
const categoryData = {
  name: "Electronics",
  code: "ELEC",
  description: "Electronic devices",
  color: "#3B82F6"
};

const result = await CategoryService.createCategory(categoryData);
```

### Adjusting Stock
```typescript
const adjustment = {
  quantity: 50,
  type: "inbound",
  reason: "Purchase order received",
  reference: "PO-12345"
};

const result = await ItemService.adjustStock(itemId, adjustment);
```

---

## 📋 Validation Rules

### Username
- Length: 3-20 chars
- Pattern: lowercase letters, numbers, underscores only
- Regex: `/^[a-z0-9_]+$/`

### Password
- Minimum: 8 characters
- Rule: Different from old password on change

### Email
- Must be valid email format
- Unique in database

### Phone
- Format: Indian phone numbers
- Pattern: `+91` or `91` prefix optional
- Regex: `/^(?:\+91|91)?[6-9]\d{9}$/`

### SKU
- Length: 1-50 chars
- Auto-converted to uppercase
- Must be unique

### Category Code
- Length: 1-20 chars
- Pattern: uppercase letters, numbers, underscores
- Regex: `/^[A-Z0-9_]+$/`

### Color
- Format: Hex color
- Pattern: `#RRGGBB`
- Regex: `/^#[0-9A-F]{6}$/i`

---

## 🔧 Configuration

### Token Expiry
- Access Token: 1 day
- Refresh Token: 7 days

### Cookie Options
- httpOnly: true (secure)
- secure: true (in production)
- sameSite: strict

### Pagination Defaults
- Page: 1
- Limit: 10
- Max Limit: 100

### Rate Limiting
- Window: 15 minutes
- Max Requests: 100

---

## 📚 Dependencies

The backend uses:
- **Express.js** - Web framework
- **Mongoose** - MongoDB ODM
- **Zod** - Schema validation
- **JWT** - Authentication
- **Bcrypt** - Password hashing
- **Nodemailer** - Email service
- **Multer** - File uploads
- **Cloudinary** - Image storage
- **Razorpay** - Payment processing

---

## ✅ Best Practices Implemented

1. **Centralized Error Handling** - ApiError class for consistency
2. **Input Validation** - Zod schemas at entry points
3. **Separation of Concerns** - Services, controllers, middleware clearly separated
4. **Type Safety** - Full TypeScript interfaces
5. **Constants** - No magic strings in code
6. **Async Handlers** - Safe Promise error handling
7. **Consistent Response Format** - ApiResponse wrapper
8. **Resource Organization** - Logical folder structure
9. **Reusable Services** - Business logic in services for testability
10. **Documentation** - Clear comments and types

---

## 🔄 Workflow Example

### Creating an Item
```
1. Frontend sends POST /api/v1/items with data
2. Controller: itemController.createItem(req, res)
3. Validation: CreateItemSchema.safeParse(req.body)
4. Service: ItemService.createItem(validatedData)
5. Service checks for duplicate SKU
6. Service creates item in MongoDB
7. Service returns result
8. Controller wraps in ApiResponse
9. Response sent to frontend
```

---

## 📖 File Organization

```
New Files Created:
✅ src/constants/index.ts
✅ src/interfaces/index.ts
✅ src/services/Item.service.ts
✅ src/services/User.service.ts
✅ src/services/Category.service.ts
✅ src/controllers/Category.controller.ts
✅ src/validators/category.schema.ts
✅ src/routes/category.route.ts

Modified Files:
✅ src/app.ts - Added category routes and health endpoint
✅ src/routes/routes.ts - Added category router export
✅ src/routes/user.route.ts - Simplified route paths
✅ src/routes/item.route.ts - Cleaned up route structure
✅ src/validators/item.schema.ts - Added types and searchschema

Existing (Unchanged):
- src/models/* - Well-structured, no changes needed
- src/controllers/Item.controller.ts - Already well-designed
- src/controllers/User.controller.ts - Already well-designed
- src/middleware/* - Functional as-is
- src/utils/* - Good utility implementations
```

---

## 🎓 Learning Points

1. **Service Layer Benefits**
   - Reusable business logic
   - Easier testing
   - Clear separation from HTTP layer
   - Can be used in multiple controllers

2. **Centralized Constants**
   - Single source of truth
   - Type-safe with const objects
   - Easy to maintain
   - Reduces string-related bugs

3. **Shared Interfaces**
   - Type safety across codebase
   - Better IDE autocomplete
   - Fewer type-related errors
   - Consistent data contracts

4. **Structured Error Handling**
   - Predictable error responses
   - Consistent error format
   - Easier debugging
   - Better user feedback

---

## 🎯 Future Enhancements

1. **Middleware Integration**
   - Add authentication check to protected routes
   - Add authorization middleware for admin-only routes
   - Add pagination middleware

2. **Monitoring & Logging**
   - Create Logger service
   - Add request/response logging
   - Track API performance

3. **Testing**
   - Unit tests for services
   - Integration tests for routes
   - Mock database for testing

4. **Caching**
   - Redis caching for frequently accessed data
   - Cache invalidation strategies
   - Performance optimization

5. **Advanced Features**
   - Audit logging for changes
   - Batch operations
   - Export to CSV/PDF
   - Advanced filtering & sorting
   - Webhook support

---

## 📞 Support

For questions about the backend structure, refer to:
- Inline code comments
- This documentation file
- Constants defined in `src/constants/index.ts`
- TypeScript interfaces in `src/interfaces/index.ts`

