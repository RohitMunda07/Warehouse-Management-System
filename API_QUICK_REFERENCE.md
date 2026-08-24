# API Endpoint Quick Reference Card

## 📱 At-a-Glance Mapping

```
Frontend Function          Backend Route              HTTP   Purpose
═════════════════════════════════════════════════════════════════════════════
fetchItems()               GET /api/items             GET    Load all items
getItemById(id)            GET /api/items/:id         GET    Get item details
createItem(data)           POST /api/items            POST   Add new item
updateItem(id, data)       PUT /api/items/:id         PUT    Update item
deleteItem(id)             DELETE /api/items/:id      DELETE Remove item

searchItems(q,cat,status)  GET /api/items/search?... GET    Search/filter
getLowStockItems()         GET /api/items/stock/... GET    Low stock alert

getWarehouseAnalytics()    GET /api/items/analytics... GET  Dashboard stats
getInventoryValue()        GET /api/items/stats/... GET    Total value
getCategoryStats()         GET /api/items/stats/... GET    By category

adjustStock(id, adj)       POST /api/items/:id/... POST   Record movement
```

---

## 🎯 By Use Case

### Dashboard Loading
```
1. getWarehouseAnalytics()   → Total stats & KPIs
2. getLowStockItems()        → Alert section
3. getCategoryStats()        → Category breakdown
```

### Inventory View
```
1. fetchItems()              → Load all items
2. searchItems(q)            → Search/filter
```

### Item Details
```
1. getItemById(id)           → Load details
2. updateItem(id, data)      → Modify fields
```

### Stock Receipt
```
1. adjustStock(id, {
     quantity: +50,
     type: 'inbound',
     reference: 'PO-123'
   })
```

### Damage Recording
```
1. adjustStock(id, {
     quantity: -5,
     type: 'damage'
   })
```

---

## 💾 Status Codes

| Code | Meaning | Common Causes |
|------|---------|---------------|
| 200 | ✅ Success | Operation completed |
| 201 | ✅ Created | Item added |
| 400 | ❌ Bad Request | Invalid data |
| 404 | ❌ Not Found | Item doesn't exist |
| 409 | ❌ Conflict | Duplicate SKU |
| 500 | ❌ Server Error | Backend issue |

---

## 🔑 Required Fields by Operation

### CREATE ITEM
```
✅ sku (unique)
✅ name
✅ category
✅ quantity
✅ unitCost
✅ sellingPrice
✅ reorderThreshold
✅ maxStock
```

### UPDATE ITEM
```
Any field can be updated
(all optional - send only what changed)
```

### ADJUST STOCK
```
✅ quantity (number, can be negative)
✅ reason (string)
⚠️  type (inbound|outbound|damage|adjustment|return)
⚠️  reference (optional but recommended)
```

---

## 🚀 Copy-Paste Examples

### List Items
```javascript
import { fetchItems } from '@/api/itemsApi';
const items = await fetchItems();
```

### Create Item
```javascript
import { createItem } from '@/api/itemsApi';
const item = await createItem({
  sku: 'ELEC-001',
  name: 'Laptop',
  category: 'Electronics',
  quantity: 50,
  unitCost: 800,
  sellingPrice: 1200,
  reorderThreshold: 10,
  maxStock: 200
});
```

### Update Item
```javascript
import { updateItem } from '@/api/itemsApi';
const updated = await updateItem(itemId, {
  quantity: 60,
  sellingPrice: 1250
});
```

### Search Items
```javascript
import { searchItems } from '@/api/itemsApi';
const results = await searchItems('laptop', 'Electronics', 'active');
```

### Get Low Stock
```javascript
import { getLowStockItems } from '@/api/itemsApi';
const lowStock = await getLowStockItems();
```

### Dashboard Stats
```javascript
import { getWarehouseAnalytics } from '@/api/itemsApi';
const stats = await getWarehouseAnalytics();
// { totalItems, totalValue, lowStockCount, ... }
```

### Record Stock Receipt
```javascript
import { adjustStock } from '@/api/itemsApi';
await adjustStock(itemId, {
  quantity: 50,
  reason: 'Stock from supplier',
  reference: 'PO-2024-001',
  type: 'inbound'
});
```

### Record Damage
```javascript
import { adjustStock } from '@/api/itemsApi';
await adjustStock(itemId, {
  quantity: -5,
  reason: 'Damaged',
  type: 'damage'
});
```

### Delete Item
```javascript
import { deleteItem } from '@/api/itemsApi';
await deleteItem(itemId);
```

---

## 🔗 URL Base

**Development**: `http://localhost:5000/api`  
**Production**: Set via `REACT_APP_API_URL` env var

---

## 📍 Location in Codebase

| Item | Path |
|------|------|
| Frontend API | `/Frontend/src/api/itemsApi.js` |
| Backend Routes | `/Backend/src/routes/item.route.ts` |
| Controllers | `/Backend/src/controllers/Item.controller.ts` |
| Models | `/Backend/src/models/Item.model.ts` |
| Frontend Context | `/Frontend/src/context/AppContext.jsx` |

---

## ⚠️ Common Mistakes

❌ Using `item._id` instead of `item.id`  
✅ Use `item.id` (already normalized)

❌ Forgetting to normalize response  
✅ itemsApi handles this automatically

❌ Not handling errors  
✅ Always use try-catch or `.catch()`

❌ Wrong adjustment direction  
✅ Positive = add, Negative = remove

❌ Changing quantity without recording reason  
✅ Use adjustStock() to track changes

---

## 🔄 Response Structure

### Item Object
```javascript
{
  id: "65d4a1b5e7c8f2g9h0i1j2k3",      // ← Use this for keys
  sku: "ELEC-001",
  name: "Laptop",
  category: "Electronics",
  quantity: 50,
  unitCost: 800,
  sellingPrice: 1200,
  reorderThreshold: 10,
  maxStock: 200,
  supplier: "TechSupply Inc",
  status: "active",
  createdAt: "2024-08-24T...",
  updatedAt: "2024-08-24T..."
}
```

### Analytics Object
```javascript
{
  totalItems: 150,
  totalQuantity: 5000,
  totalValue: 120000,
  avgUnitCost: 24,
  lowStockCount: 12,
  overStockCount: 3,
  topCategories: [
    { _id: "Electronics", count: 45, value: 50000 }
  ]
}
```

---

**Print this card and keep it handy! 📋**
