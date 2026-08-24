# Warehouse Management System (WMS) - Backend

A robust, scalable Node.js/Express/MongoDB backend for comprehensive warehouse inventory management with real-time stock tracking, multi-location warehousing, and advanced analytics.

## 🎯 Overview

This WMS backend provides a complete API for managing warehouse inventory with features including:
- **Item Management**: Create, read, update, delete inventory items
- **Stock Tracking**: Real-time inventory levels across multiple warehouse locations
- **Stock Movements**: Track inbound, outbound, damage, adjustment, and return transactions
- **Category Management**: Hierarchical product categorization
- **Analytics**: Comprehensive inventory analytics and warehouse statistics
- **Low Stock Alerts**: Automatic tracking of items below reorder thresholds

## 📁 Project Structure

```
Backend/
├── src/
│   ├── controllers/
│   │   ├── Item.controller.ts         # Item CRUD & analytics operations
│   │   └── User.controller.ts         # Authentication management
│   ├── models/
│   │   ├── Item.model.ts              # Item schema with WMS features
│   │   ├── Category.model.ts          # Product category hierarchy
│   │   └── User.model.ts              # User authentication
│   ├── routes/
│   │   ├── item.route.ts              # Item endpoints
│   │   ├── user.route.ts              # User endpoints
│   │   └── routes.ts                  # Route exports
│   ├── validators/
│   │   ├── item.schema.ts             # Zod validation schemas
│   │   └── user.schema.ts
│   ├── middleware/
│   │   ├── auth.middleware.ts         # Authentication
│   │   ├── error.middleware.ts        # Error handling
│   │   └── rateLimiter.ts             # Rate limiting
│   ├── utils/
│   │   ├── apiResponse.ts             # Response formatter
│   │   ├── apiError.ts                # Error handler
│   │   ├── asyncHandler.ts            # Async wrapper
│   │   └── cloudinary.ts              # Image storage
│   ├── config/
│   │   ├── db.ts                      # Database config
│   │   └── env.ts                     # Environment variables
│   ├── app.ts                         # Express app setup
│   └── index.ts                       # Server entry point
├── tsconfig.json                      # TypeScript configuration
├── package.json                       # Dependencies
└── .env                              # Environment variables
```

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- MongoDB 7.0+
- npm or yarn

### Installation

```bash
# Install dependencies
npm install

# Create .env file
cp .env.sample .env

# Configure environment variables
# Update DATABASE_URL, PORT, etc. in .env

# Start development server
npm run dev
```

### Environment Variables

```env
PORT=5000
DATABASE_URL=mongodb://localhost:27017/wms
NODE_ENV=development
CORS_ORIGIN=http://localhost:5173
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRY=7d
CLOUDINARY_NAME=your_cloudinary_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

## 📚 API Documentation

### Base URL
```
http://localhost:5000/api
```

### Items Endpoints

#### Get All Items
```http
GET /items
```
Returns all active warehouse items.

#### Search Items
```http
GET /items/search?q=search_term&category=electronics&status=active
```
Search items by name, SKU, or description with optional filters.

#### Get Item by ID
```http
GET /items/:id
```
Retrieve a specific item with full details.

#### Create Item
```http
POST /items
Content-Type: application/json

{
  "sku": "ELEC-001",
  "name": "Laptop",
  "category": "Electronics",
  "quantity": 50,
  "unitCost": 800,
  "sellingPrice": 1200,
  "reorderThreshold": 10,
  "maxStock": 200,
  "supplier": "TechSupplies Inc",
  "unit": "piece"
}
```

#### Update Item
```http
PUT /items/:id
Content-Type: application/json

{
  "quantity": 60,
  "sellingPrice": 1250
}
```

#### Adjust Stock
```http
POST /items/:id/adjust-stock
Content-Type: application/json

{
  "quantity": 25,
  "reason": "Stock received from supplier",
  "reference": "PO-2024-001",
  "type": "inbound"
}
```

**Stock Movement Types:**
- `inbound` - Stock received from supplier
- `outbound` - Stock shipped to customer
- `adjustment` - Manual inventory adjustment
- `damage` - Damaged/defective items
- `return` - Returned items from customer

#### Delete Item
```http
DELETE /items/:id
```

### Analytics Endpoints

#### Get Warehouse Analytics
```http
GET /items/analytics/warehouse
```
Get comprehensive warehouse statistics including total inventory value, item count, low stock items, and top categories.

**Response:**
```json
{
  "totalItems": 150,
  "totalQuantity": 5000,
  "totalValue": 120000,
  "avgUnitCost": 24,
  "lowStockCount": 12,
  "overStockCount": 3,
  "topCategories": [...]
}
```

#### Get Category Statistics
```http
GET /items/stats/category
```
Get inventory statistics grouped by category.

#### Get Low Stock Items
```http
GET /items/stock/low-stock
```
Get all items below reorder threshold.

#### Get Inventory Value
```http
GET /items/stats/inventory-value
```
Calculate total inventory value.

## 🏗️ Item Model Details

### Core Fields
| Field | Type | Description |
|-------|------|-------------|
| `sku` | String | Unique Stock Keeping Unit (required, uppercase) |
| `name` | String | Product name (required) |
| `category` | String | Product category (required) |
| `quantity` | Number | Current stock level |
| `unitCost` | Number | Cost per unit |
| `sellingPrice` | Number | Selling price per unit |
| `reorderThreshold` | Number | Minimum quantity for reorder alert |
| `maxStock` | Number | Maximum warehouse capacity |
| `safetyStock` | Number | Emergency reserve level |

### Advanced Fields
| Field | Type | Description |
|-------|------|-------------|
| `warehouseStocks` | Array | Stock at multiple locations |
| `stockMovements` | Array | History of all stock transitions |
| `supplier` | String | Supplier name |
| `batchNumber` | String | Batch/lot identifier |
| `expiryDate` | Date | Product expiration date |
| `weight` | Number | Item weight in kg |
| `dimensions` | Object | Length, width, height |
| `isFragile` | Boolean | Flag for fragile items |
| `requiresRefrigeration` | Boolean | Special handling flag |

## 🔐 Authentication

User authentication is managed through JWT tokens. Authentication middleware is set up but optional for basic WMS operations. To enable:

1. Uncomment auth middleware in routes
2. Include Authorization header in requests:
```http
Authorization: Bearer <jwt_token>
```

## 📊 Database Indexes

Optimized indexes for performance:
- SKU (unique, ascending)
- Category + Status
- Quantity + Reorder Threshold
- Supplier + Status
- Created At (descending)

## 🛠️ Development

### Build TypeScript
```bash
npx tsc -p tsconfig.json --noEmit
```

### Run Dev Server with Hot Reload
```bash
npm run dev
```

### Common Issues

**Issue: Cannot connect to MongoDB**
- Verify MongoDB is running: `mongosh`
- Check DATABASE_URL in .env
- Ensure network access is allowed

**Issue: Port already in use**
- Kill process: `lsof -ti:5000 | xargs kill -9`
- Or change PORT in .env

## 🚚 Stock Movement Workflow

```
┌─────────────┐
│   Inbound   │ (Receiving from supplier)
└──────┬──────┘
       │
       ▼
┌─────────────────┐
│  Healthy Stock  │ (Available for sale)
└──────┬──────────┘
       │
       ├─── Outbound ──────► (Shipped to customer)
       │
       ├─── Damage ────────► (Defective items)
       │
       ├─── Adjustment ───► (Inventory count fix)
       │
       └─── Return ───────► (Returned from customer)
```

## 📈 Inventory Levels

| Level | Threshold | Status | Action |
|-------|-----------|--------|--------|
| Healthy | > 1.5 × Reorder | ✅ | Normal operations |
| Watch | 1.0-1.5 × Reorder | ⚠️ | Monitor closely |
| Reorder | < Reorder | 🔴 | Place order immediately |

## 🤝 Contributing

Contributions are welcome! Please follow these guidelines:
1. Create feature branch: `git checkout -b feature/item-tracking`
2. Commit changes: `git commit -am 'Add item tracking'`
3. Push to branch: `git push origin feature/item-tracking`
4. Submit pull request

## 📝 License

This project is proprietary and confidential.

## 🆘 Support

For issues or questions, please contact:
- Development Team: dev@waretrack.local
- Documentation: /docs/API.md

---

**Version:** 2.0.0 (WMS Edition)  
**Last Updated:** August 2024
