# Frontend-Backend API Mapping Guide

## 🔗 Complete Route Mapping

This guide maps all frontend functions to backend endpoints with usage examples.

---

## 📋 Table of Contents

1. [Basic CRUD Operations](#basic-crud-operations)
2. [Search & Filtering](#search--filtering)
3. [Analytics & Statistics](#analytics--statistics)
4. [Stock Management](#stock-management)
5. [Usage Examples](#usage-examples)
6. [Error Handling](#error-handling)

---

## Basic CRUD Operations

### 1. Fetch All Items

| Property | Value |
|----------|-------|
| **Frontend Function** | `fetchItems()` |
| **Backend Route** | `GET /api/items` |
| **Controller** | `Item.controller.ts` → `getAllItems()` |
| **Purpose** | Load all active items for dashboard/inventory |
| **Returns** | `Array<Item>` - All items with normalized IDs |
| **Status Code** | `200 OK` |

**Frontend Code:**
```javascript
import { fetchItems } from '@/api/itemsApi';

// In component
const { items, loading } = useApp();

// Or direct call
const items = await fetchItems();
console.log(items); // [{ id, sku, name, quantity, ... }]
```

**Backend Response:**
```json
{
  "statusCode": 200,
  "data": [
    {
      "_id": "65d4a1b5e7c8f2g9h0i1j2k3",
      "sku": "ELEC-001",
      "name": "Laptop",
      "category": "Electronics",
      "quantity": 50,
      "status": "active"
    }
  ],
  "message": "Items fetched successfully"
}
```

---

### 2. Get Item by ID

| Property | Value |
|----------|-------|
| **Frontend Function** | `getItemById(id)` |
| **Backend Route** | `GET /api/items/:id` |
| **Controller** | `Item.controller.ts` → `getItemById()` |
| **Purpose** | Load single item details |
| **Parameter** | `id` - MongoDB ObjectId (string) |
| **Returns** | `Object` - Single item with all fields |
| **Status Code** | `200 OK` or `404 Not Found` |

**Frontend Code:**
```javascript
import { getItemById } from '@/api/itemsApi';

const item = await getItemById('65d4a1b5e7c8f2g9h0i1j2k3');
console.log(item);
// {
//   id: '65d4a1b5e7c8f2g9h0i1j2k3',
//   sku: 'ELEC-001',
//   name: 'Laptop',
//   quantity: 50,
//   unitCost: 800,
//   ...
// }
```

---

### 3. Create Item

| Property | Value |
|----------|-------|
| **Frontend Function** | `createItem(item)` |
| **Backend Route** | `POST /api/items` |
| **Controller** | `Item.controller.ts` → `createItem()` |
| **Purpose** | Add new item to inventory |
| **Request Body** | Item data object |
| **Returns** | `Object` - Created item with ID |
| **Status Code** | `201 Created` or `400 Bad Request` |

**Frontend Code:**
```javascript
import { createItem } from '@/api/itemsApi';

const newItem = {
  sku: 'ELECT-002',
  name: 'Monitor 24"',
  category: 'Electronics',
  quantity: 25,
  unitCost: 250,
  sellingPrice: 350,
  reorderThreshold: 5,
  maxStock: 100,
  supplier: 'TechSupply Inc'
};

const created = await createItem(newItem);
console.log(created.id); // MongoDB ID assigned by backend
```

**Required Fields in Request:**
- `sku` - Unique identifier
- `name` - Product name
- `category` - Category
- `quantity` - Current stock
- `unitCost` - Cost
- `sellingPrice` - Selling price
- `reorderThreshold` - Reorder level
- `maxStock` - Max capacity

---

### 4. Update Item

| Property | Value |
|----------|-------|
| **Frontend Function** | `updateItem(id, item)` |
| **Backend Route** | `PUT /api/items/:id` |
| **Controller** | `Item.controller.ts` → `updateItem()` |
| **Purpose** | Modify existing item |
| **Parameters** | `id` - MongoDB ID, `item` - partial/full data |
| **Returns** | `Object` - Updated item |
| **Status Code** | `200 OK` or `404 Not Found` |

**Frontend Code:**
```javascript
import { updateItem } from '@/api/itemsApi';

// Update single field
const updated = await updateItem('65d4a1b5e7c8f2g9h0i1j2k3', {
  quantity: 60,
  sellingPrice: 380
});

// Or update multiple fields
const fullUpdate = await updateItem(itemId, {
  name: 'Updated Name',
  supplier: 'New Supplier',
  reorderThreshold: 15
});
```

**Note:** Only include fields you want to update (partial update supported)

---

### 5. Delete Item

| Property | Value |
|----------|-------|
| **Frontend Function** | `deleteItem(id)` |
| **Backend Route** | `DELETE /api/items/:id` |
| **Controller** | `Item.controller.ts` → `deleteItem()` |
| **Purpose** | Remove item from inventory |
| **Parameter** | `id` - MongoDB ObjectId |
| **Returns** | `Object` - Confirmation message |
| **Status Code** | `200 OK` or `404 Not Found` |

**Frontend Code:**
```javascript
import { deleteItem } from '@/api/itemsApi';

await deleteItem('65d4a1b5e7c8f2g9h0i1j2k3');
console.log('Item deleted successfully');
```

---

## Search & Filtering

### 6. Search Items

| Property | Value |
|----------|-------|
| **Frontend Function** | `searchItems(q, category, status)` |
| **Backend Route** | `GET /api/items/search?q=<query>&category=<cat>&status=<status>` |
| **Controller** | `Item.controller.ts` → `searchItems()` |
| **Purpose** | Search by keyword and filter results |
| **Parameters** | `q` - search term, `category` - filter, `status` - filter |
| **Returns** | `Array<Item>` - Filtered items |
| **Status Code** | `200 OK` |

**Frontend Code:**
```javascript
import { searchItems } from '@/api/itemsApi';

// Search by SKU or name
const results = await searchItems('laptop');

// Search with category filter
const electronics = await searchItems('', 'Electronics');

// Search with status filter
const active = await searchItems('laptop', 'Electronics', 'active');

// All parameters
const filtered = await searchItems('SKU-123', 'Electronics', 'active');
```

**Search Scope:**
- Searches in: SKU, Name, Description
- Case-insensitive

---

### 7. Get Low Stock Items

| Property | Value |
|----------|-------|
| **Frontend Function** | `getLowStockItems()` |
| **Backend Route** | `GET /api/items/stock/low-stock` |
| **Controller** | `Item.controller.ts` → `getLowStockItems()` |
| **Purpose** | Get items below reorder threshold |
| **Returns** | `Array<Item>` - Items sorted by quantity |
| **Status Code** | `200 OK` |

**Frontend Code:**
```javascript
import { getLowStockItems } from '@/api/itemsApi';

const lowStock = await getLowStockItems();
console.log(`${lowStock.length} items need reordering`);

// Display in "Low Stock Alert" section
lowStock.forEach(item => {
  console.log(`${item.name}: ${item.quantity} (min: ${item.reorderThreshold})`);
});
```

**Criteria:**
- `quantity <= reorderThreshold`
- Sorted by quantity (ascending)

---

## Analytics & Statistics

### 8. Get Warehouse Analytics

| Property | Value |
|----------|-------|
| **Frontend Function** | `getWarehouseAnalytics()` |
| **Backend Route** | `GET /api/items/analytics/warehouse` |
| **Controller** | `Item.controller.ts` → `getWarehouseAnalytics()` |
| **Purpose** | Get comprehensive warehouse KPIs |
| **Returns** | `Object` - Analytics data |
| **Status Code** | `200 OK` |

**Frontend Code:**
```javascript
import { getWarehouseAnalytics } from '@/api/itemsApi';

const analytics = await getWarehouseAnalytics();

console.log({
  totalItems: analytics.totalItems,           // 150
  totalQuantity: analytics.totalQuantity,     // 5000
  totalValue: analytics.totalValue,           // $120,000
  avgUnitCost: analytics.avgUnitCost,         // $24
  lowStockCount: analytics.lowStockCount,     // 12
  overStockCount: analytics.overStockCount,   // 3
  topCategories: analytics.topCategories      // [...]
});
```

**Response Structure:**
```json
{
  "totalItems": 150,
  "totalQuantity": 5000,
  "totalValue": 120000,
  "avgUnitCost": 24,
  "lowStockCount": 12,
  "overStockCount": 3,
  "topCategories": [
    { "_id": "Electronics", "count": 45, "value": 50000 },
    { "_id": "Furniture", "count": 30, "value": 35000 }
  ]
}
```

**Dashboard Usage:**
```javascript
// Dashboard.jsx
const analytics = await getWarehouseAnalytics();

return (
  <div className="stat-grid">
    <StatCard label="Total SKUs" value={analytics.totalItems} />
    <StatCard 
      label="Low Stock Items" 
      value={analytics.lowStockCount}
      delta={`of ${analytics.totalItems}`}
    />
    <StatCard 
      label="Inventory Value" 
      value={`$${analytics.totalValue.toLocaleString()}`}
    />
  </div>
);
```

---

### 9. Get Inventory Value

| Property | Value |
|----------|-------|
| **Frontend Function** | `getInventoryValue()` |
| **Backend Route** | `GET /api/items/stats/inventory-value` |
| **Controller** | `Item.controller.ts` → `getInventoryValue()` |
| **Purpose** | Calculate total inventory value |
| **Returns** | `Object` - Value statistics |
| **Status Code** | `200 OK` |

**Frontend Code:**
```javascript
import { getInventoryValue } from '@/api/itemsApi';

const value = await getInventoryValue();

console.log(`Total Inventory Value: $${value.totalValue}`);
console.log(`Items in Stock: ${value.totalItems}`);
console.log(`Total Quantity: ${value.totalQuantity} units`);
```

---

### 10. Get Category Statistics

| Property | Value |
|----------|-------|
| **Frontend Function** | `getCategoryStats()` |
| **Backend Route** | `GET /api/items/stats/category` |
| **Controller** | `Item.controller.ts` → `getCategoryStats()` |
| **Purpose** | Get breakdown by product category |
| **Returns** | `Array<Object>` - Category breakdown |
| **Status Code** | `200 OK` |

**Frontend Code:**
```javascript
import { getCategoryStats } from '@/api/itemsApi';

const stats = await getCategoryStats();

stats.forEach(category => {
  console.log(`${category._id}:`);
  console.log(`  Items: ${category.count}`);
  console.log(`  Total Quantity: ${category.totalQuantity}`);
  console.log(`  Total Value: $${category.totalValue}`);
  console.log(`  Low Stock Items: ${category.low}`);
});
```

**Response:**
```json
[
  {
    "_id": "Electronics",
    "count": 45,
    "totalQuantity": 2000,
    "totalValue": 50000,
    "low": 8
  },
  {
    "_id": "Furniture",
    "count": 30,
    "totalQuantity": 1500,
    "totalValue": 35000,
    "low": 4
  }
]
```

---

## Stock Management

### 11. Adjust Stock (NEW!)

| Property | Value |
|----------|-------|
| **Frontend Function** | `adjustStock(id, adjustment)` |
| **Backend Route** | `POST /api/items/:id/adjust-stock` |
| **Controller** | `Item.controller.ts` → `adjustStock()` |
| **Purpose** | Record stock movements (inbound/outbound/damage/etc) |
| **Parameters** | `id` - Item ID, `adjustment` - Movement details |
| **Returns** | `Object` - Updated item |
| **Status Code** | `200 OK` or `400 Bad Request` |

**Frontend Code:**

**Scenario 1: Stock Received (Inbound)**
```javascript
import { adjustStock } from '@/api/itemsApi';

const result = await adjustStock(itemId, {
  quantity: 50,                                    // +50 units
  reason: 'Stock received from supplier',
  reference: 'PO-2024-001',                       // Purchase Order
  type: 'inbound'                                 // Type
});

console.log(`New quantity: ${result.quantity}`);
```

**Scenario 2: Damaged Items**
```javascript
await adjustStock(itemId, {
  quantity: -5,                                    // -5 units
  reason: 'Damaged during storage',
  type: 'damage'
});
```

**Scenario 3: Manual Adjustment**
```javascript
await adjustStock(itemId, {
  quantity: 10,                                    // Correction
  reason: 'Physical count discrepancy',
  type: 'adjustment'
});
```

**Scenario 4: Customer Return**
```javascript
await adjustStock(itemId, {
  quantity: 3,                                     // +3 units
  reason: 'Returned by customer',
  reference: 'RMA-12345',                         // Return Merchandise Auth
  type: 'return'
});
```

**Scenario 5: Outbound (Sale/Shipment)**
```javascript
await adjustStock(itemId, {
  quantity: -10,                                   // -10 units
  reason: 'Shipped to customer',
  reference: 'SO-56789',                          // Sales Order
  type: 'outbound'
});
```

**Stock Movement Types:**
- `inbound` - Stock received
- `outbound` - Stock shipped/sold
- `damage` - Damaged/defective
- `adjustment` - Count correction
- `return` - Customer return

---

## Usage Examples

### Example 1: Complete Item Form Submission

```javascript
import { createItem, updateItem } from '@/api/itemsApi';

async function handleSaveItem(formData, editingItem) {
  try {
    if (editingItem) {
      // Update existing
      const updated = await updateItem(editingItem.id, {
        name: formData.name,
        quantity: formData.quantity,
        sellingPrice: formData.sellingPrice,
        reorderThreshold: formData.reorderThreshold
      });
      showToast(`Updated ${updated.name}`, 'success');
    } else {
      // Create new
      const created = await createItem({
        sku: formData.sku,
        name: formData.name,
        category: formData.category,
        quantity: formData.quantity,
        unitCost: formData.unitCost,
        sellingPrice: formData.sellingPrice,
        reorderThreshold: formData.reorderThreshold,
        maxStock: formData.maxStock,
        supplier: formData.supplier
      });
      showToast(`Created ${created.name}`, 'success');
    }
  } catch (error) {
    showToast('Failed to save item', 'error');
  }
}
```

### Example 2: Dashboard with Real-time Analytics

```javascript
import { 
  fetchItems, 
  getWarehouseAnalytics, 
  getLowStockItems 
} from '@/api/itemsApi';

async function loadDashboard() {
  try {
    const [items, analytics, lowStock] = await Promise.all([
      fetchItems(),
      getWarehouseAnalytics(),
      getLowStockItems()
    ]);

    return {
      items,
      analytics,
      lowStock,
      hasAlerts: lowStock.length > 0
    };
  } catch (error) {
    console.error('Dashboard load failed:', error);
  }
}
```

### Example 3: Search with Filters

```javascript
import { searchItems } from '@/api/itemsApi';

async function handleSearchAndFilter(searchTerm, category, status) {
  const results = await searchItems(
    searchTerm,
    category,
    status
  );

  console.log(`Found ${results.length} items`);
  return results;
}
```

### Example 4: Stock Receipt Workflow

```javascript
import { adjustStock, getItemById } from '@/api/itemsApi';

async function receiveStockFromSupplier(itemId, quantityReceived, poNumber) {
  try {
    // Record the incoming stock
    const updated = await adjustStock(itemId, {
      quantity: quantityReceived,
      reason: 'Stock received from supplier',
      reference: poNumber,
      type: 'inbound'
    });

    console.log(`Stock updated: ${updated.quantity} units now in warehouse`);
    
    // Check if back in healthy stock
    if (updated.quantity > updated.reorderThreshold) {
      showNotification('✅ Item back in stock', 'success');
    }

    return updated;
  } catch (error) {
    showNotification('❌ Failed to record stock receipt', 'error');
  }
}
```

---

## Error Handling

### Client-Side Error Handling

```javascript
import { handleApiError } from '@/api/itemsApi';

async function safeItemOperation() {
  try {
    const item = await getItemById('invalid-id');
  } catch (error) {
    const apiError = handleApiError(error);
    
    console.error(`Error [${apiError.status}]: ${apiError.message}`);
    
    if (apiError.errors) {
      apiError.errors.forEach(err => {
        console.error(`  - ${err.field}: ${err.message}`);
      });
    }

    // Show user-friendly message
    showToast(apiError.message, 'error');
  }
}
```

### Common Error Scenarios

| Scenario | Status | Error Message | Solution |
|----------|--------|---------------|----------|
| Item not found | 404 | "Item not found" | Check item ID |
| Duplicate SKU | 409 | "Item with this SKU already exists" | Use unique SKU |
| Validation failed | 400 | "Validation failed" | Check required fields |
| Network error | 0 | "Network error" | Check backend running |
| Invalid quantity| 400 | "Cannot reduce stock below 0" | Check adjustment amount |

---

## 🔄 Environment Configuration

### .env File (Frontend)
```env
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_NODE_ENV=development
```

### .env File (Backend)
```env
PORT=5000
DATABASE_URL=mongodb://localhost:27017/wms
NODE_ENV=development
CORS_ORIGIN=http://localhost:5173
```

---

## 📊 API Response Format

All endpoints return standardized response:

**Success (2xx)**
```json
{
  "statusCode": 200,
  "data": { /* actual data */ },
  "message": "Operation successful"
}
```

**Error (4xx/5xx)**
```json
{
  "statusCode": 400,
  "data": null,
  "message": "Error description",
  "errors": [
    { "field": "sku", "message": "SKU is required" }
  ]
}
```

---

## 🚀 Quick Start Checklist

- [ ] Backend running: `npm run dev` in Backend folder
- [ ] Frontend running: `npm run dev` in Frontend folder
- [ ] CORS configured correctly
- [ ] MongoDB connected
- [ ] API_BASE URL matches backend
- [ ] Test items API in browser: `http://localhost:5000/api/items`

---

## 📚 Additional Resources

- Full API docs: [WMS_README.md](../WMS_README.md)
- Database schema: [Item.model.ts](../src/models/Item.model.ts)
- Backend routes: [item.route.ts](../src/routes/item.route.ts)
- Frontend hooks: [AppContext.jsx](./context/AppContext.jsx)

---

**Version**: 2.0.0  
**Last Updated**: August 24, 2024  
**Status**: ✅ Complete
