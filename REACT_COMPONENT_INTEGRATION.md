# React Component Integration Guide

## 🎯 How to Use API Functions in Components

This guide shows how to integrate backend API calls into React components.

---

## 📋 Table of Contents

1. [Basic Pattern](#basic-pattern)
2. [Dashboard Component](#dashboard-component)
3. [Inventory Table Component](#inventory-table-component)
4. [Item Form Component](#item-form-component)
5. [Stock Adjustment Component](#stock-adjustment-component)
6. [Search Component](#search-component)
7. [Error Handling](#error-handling)

---

## Basic Pattern

### Direct API Call
```javascript
import { fetchItems } from '@/api/itemsApi';

// Simple component
function MyComponent() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadItems();
  }, []);

  const loadItems = async () => {
    try {
      setLoading(true);
      const data = await fetchItems();
      setItems(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      {items.map(item => (
        <div key={item.id}>{item.name}</div>
      ))}
    </div>
  );
}
```

### Using Context (Recommended)
```javascript
// From AppContext.jsx - already integrated!
import { useApp } from '@/context/AppContext';

function MyComponent() {
  const { items, loading, error } = useApp();

  // items, loading, error are already managed
  // Just use them!
  return (
    <div>
      {items.map(item => (
        <div key={item.id}>{item.name}</div>
      ))}
    </div>
  );
}
```

---

## Dashboard Component

### Complete Dashboard with Multiple Queries

```javascript
// Dashboard.jsx
import { useEffect, useState, useMemo } from 'react';
import { useApp } from '@/context/AppContext';
import {
  getWarehouseAnalytics,
  getLowStockItems,
  getCategoryStats
} from '@/api/itemsApi';
import StatCard from '@/components/StatCard';
import HealthBar from '@/components/HealthBar';

export default function Dashboard() {
  const { items, loading } = useApp();
  const [analytics, setAnalytics] = useState(null);
  const [lowStock, setLowStock] = useState([]);
  const [categoryStats, setCategoryStats] = useState([]);
  const [analyticsLoading, setAnalyticsLoading] = useState(true);

  // Load analytics on component mount
  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = async () => {
    try {
      setAnalyticsLoading(true);
      const [analyticsData, lowStockData, categoryData] = await Promise.all([
        getWarehouseAnalytics(),
        getLowStockItems(),
        getCategoryStats()
      ]);

      setAnalytics(analyticsData);
      setLowStock(lowStockData);
      setCategoryStats(categoryData);
    } catch (error) {
      console.error('Failed to load analytics:', error);
      // Show user-friendly error message
    } finally {
      setAnalyticsLoading(false);
    }
  };

  // Calculate stats
  const stats = useMemo(() => {
    if (!analytics) return null;
    return {
      total: analytics.totalItems,
      value: `$${analytics.totalValue.toLocaleString()}`,
      lowStock: analytics.lowStockCount
    };
  }, [analytics]);

  if (analyticsLoading) {
    return <div className="loading">Loading dashboard...</div>;
  }

  return (
    <div className="dashboard">
      {/* KPI Cards */}
      <div className="stat-grid">
        <StatCard label="Total SKUs" value={stats?.total} />
        <StatCard
          label="Low Stock"
          value={stats?.lowStock}
          delta="Items need reorder"
          direction="down"
        />
        <StatCard label="Inventory Value" value={stats?.value} />
      </div>

      {/* Low Stock Alert Section */}
      {lowStock.length > 0 && (
        <div className="alerts">
          <h3>🔴 Low Stock Alert ({lowStock.length})</h3>
          <table>
            <thead>
              <tr>
                <th>SKU</th>
                <th>Name</th>
                <th>Quantity</th>
                <th>Threshold</th>
              </tr>
            </thead>
            <tbody>
              {lowStock.slice(0, 5).map(item => (
                <tr key={item.id}>
                  <td>{item.sku}</td>
                  <td>{item.name}</td>
                  <td>{item.quantity}</td>
                  <td>{item.reorderThreshold}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Category Breakdown */}
      {categoryStats.length > 0 && (
        <div className="category-stats">
          <h3>Inventory by Category</h3>
          {categoryStats.map(cat => (
            <div key={cat._id} className="category-row">
              <span>{cat._id}</span>
              <span>${cat.totalValue}</span>
              <span>{cat.count} items</span>
            </div>
          ))}
        </div>
      )}

      {/* Refresh Button */}
      <button onClick={loadAnalytics}>Refresh Data</button>
    </div>
  );
}
```

---

## Inventory Table Component

### List All Items with Actions

```javascript
// Inventory.jsx
import { useState, useMemo } from 'react';
import { useApp } from '@/context/AppContext';
import { searchItems, deleteItem } from '@/api/itemsApi';
import {
  HealthBar,
  StatusBadge,
  Toast
} from '@/components';

const PAGE_SIZE = 10;

export default function Inventory() {
  const { items, loading, removeItem, openEditForm, openAddForm } = useApp();
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('all');
  const [page, setPage] = useState(1);
  const [toast, setToast] = useState(null);

  // Filter items based on search and category
  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    return items.filter(it => {
      const matchesSearch = !term ||
        it.name.toLowerCase().includes(term) ||
        it.sku.toLowerCase().includes(term);

      const matchesCategory = category === 'all' || it.category === category;

      return matchesSearch && matchesCategory;
    });
  }, [items, search, category]);

  // Pagination
  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginatedItems = filtered.slice(
    (page - 1) * PAGE_SIZE,
    page * PAGE_SIZE
  );

  const categories = useMemo(
    () => ['all', ...new Set(items.map(it => it.category))],
    [items]
  );

  // Handle delete
  const handleDelete = async (item) => {
    if (!window.confirm(`Delete ${item.name}?`)) return;

    try {
      await deleteItem(item.id);
      removeItem(item);
      showToast(`${item.name} deleted`, 'success');
    } catch (error) {
      showToast('Failed to delete item', 'error');
    }
  };

  const showToast = (message, type = 'info') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  return (
    <div className="inventory">
      {/* Header */}
      <div className="page-head">
        <div>
          <h2>Inventory</h2>
          <p>{filtered.length} of {items.length} items</p>
        </div>
        <button className="btn btn-primary" onClick={openAddForm}>
          ➕ Add Item
        </button>
      </div>

      {/* Search & Filter */}
      <div className="toolbar">
        <input
          type="text"
          placeholder="Search by name or SKU..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
        />

        <select
          value={category}
          onChange={(e) => {
            setCategory(e.target.value);
            setPage(1);
          }}
        >
          {categories.map(cat => (
            <option key={cat} value={cat}>
              {cat === 'all' ? 'All Categories' : cat}
            </option>
          ))}
        </select>
      </div>

      {/* Table */}
      {loading ? (
        <div>Loading inventory...</div>
      ) : (
        <>
          <table>
            <thead>
              <tr>
                <th>SKU</th>
                <th>Name</th>
                <th>Category</th>
                <th>Quantity</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginatedItems.map(item => (
                <tr key={item.id}>
                  <td>{item.sku}</td>
                  <td>{item.name}</td>
                  <td>{item.category}</td>
                  <td>
                    <HealthBar
                      current={item.quantity}
                      min={item.reorderThreshold}
                      max={item.maxStock}
                    />
                  </td>
                  <td>
                    <StatusBadge status={item.status} />
                  </td>
                  <td className="actions">
                    <button onClick={() => openEditForm(item)}>Edit</button>
                    <button
                      className="danger"
                      onClick={() => handleDelete(item)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Pagination */}
          <div className="pagination">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
              <button
                key={p}
                className={page === p ? 'active' : ''}
                onClick={() => setPage(p)}
              >
                {p}
              </button>
            ))}
          </div>
        </>
      )}

      {/* Toast Notification */}
      {toast && <Toast message={toast.message} type={toast.type} />}
    </div>
  );
}
```

---

## Item Form Component

### Create/Edit Item Form

```javascript
// ItemFormModal.jsx
import { useState } from 'react';
import { createItem, updateItem } from '@/api/itemsApi';
import { useApp } from '@/context/AppContext';

export default function ItemFormModal({ isOpen, item, onClose }) {
  const { openEditForm } = useApp();
  const [formData, setFormData] = useState(
    item || {
      sku: '',
      name: '',
      category: '',
      quantity: 0,
      unitCost: 0,
      sellingPrice: 0,
      reorderThreshold: 0,
      maxStock: 0,
      supplier: ''
    }
  );
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name.includes('quantity') || name.includes('Cost') || name.includes('Price')
        ? Number(value)
        : value
    }));
    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (item) {
        // Update existing
        await updateItem(item.id, formData);
      } else {
        // Create new
        await createItem(formData);
      }

      // Trigger refresh from parent
      onClose();
    } catch (error) {
      // Handle validation errors
      if (error.response?.data?.errors) {
        const errorMap = {};
        error.response.data.errors.forEach(err => {
          errorMap[err.path] = err.message;
        });
        setErrors(errorMap);
      } else {
        setErrors({ general: error.message });
      }
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal">
      <div className="modal-content">
        <h2>{item ? 'Edit Item' : 'Add Item'}</h2>

        <form onSubmit={handleSubmit}>
          {/* SKU Field */}
          <div className="form-group">
            <label>SKU *</label>
            <input
              type="text"
              name="sku"
              value={formData.sku}
              onChange={handleChange}
              disabled={!!item} // Can't change SKU on edit
              className={errors.sku ? 'error' : ''}
            />
            {errors.sku && <span className="error">{errors.sku}</span>}
          </div>

          {/* Name Field */}
          <div className="form-group">
            <label>Name *</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className={errors.name ? 'error' : ''}
            />
            {errors.name && <span className="error">{errors.name}</span>}
          </div>

          {/* Category Field */}
          <div className="form-group">
            <label>Category *</label>
            <input
              type="text"
              name="category"
              value={formData.category}
              onChange={handleChange}
              list="categories"
              className={errors.category ? 'error' : ''}
            />
            <datalist id="categories">
              <option>Electronics</option>
              <option>Furniture</option>
              <option>Clothing</option>
            </datalist>
            {errors.category && <span className="error">{errors.category}</span>}
          </div>

          {/* Quantity Field */}
          <div className="form-row">
            <div className="form-group">
              <label>Quantity *</label>
              <input
                type="number"
                name="quantity"
                value={formData.quantity}
                onChange={handleChange}
                className={errors.quantity ? 'error' : ''}
              />
            </div>

            <div className="form-group">
              <label>Unit Cost *</label>
              <input
                type="number"
                name="unitCost"
                value={formData.unitCost}
                onChange={handleChange}
                step="0.01"
                className={errors.unitCost ? 'error' : ''}
              />
            </div>
          </div>

          {/* Pricing Row */}
          <div className="form-row">
            <div className="form-group">
              <label>Selling Price *</label>
              <input
                type="number"
                name="sellingPrice"
                value={formData.sellingPrice}
                onChange={handleChange}
                step="0.01"
              />
            </div>

            <div className="form-group">
              <label>Supplier</label>
              <input
                type="text"
                name="supplier"
                value={formData.supplier}
                onChange={handleChange}
              />
            </div>
          </div>

          {/* Stock Management Row */}
          <div className="form-row">
            <div className="form-group">
              <label>Reorder Threshold *</label>
              <input
                type="number"
                name="reorderThreshold"
                value={formData.reorderThreshold}
                onChange={handleChange}
              />
              <small>Alert when stock falls below this</small>
            </div>

            <div className="form-group">
              <label>Max Stock *</label>
              <input
                type="number"
                name="maxStock"
                value={formData.maxStock}
                onChange={handleChange}
              />
              <small>Maximum warehouse capacity</small>
            </div>
          </div>

          {/* General Error */}
          {errors.general && (
            <div className="error-message">{errors.general}</div>
          )}

          {/* Buttons */}
          <div className="form-actions">
            <button type="button" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" disabled={loading}>
              {loading ? 'Saving...' : item ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
```

---

## Stock Adjustment Component

### Record Stock Movement

```javascript
// StockAdjustmentModal.jsx
import { useState } from 'react';
import { adjustStock } from '@/api/itemsApi';
import { useApp } from '@/context/AppContext';

export default function StockAdjustmentModal({ item, isOpen, onClose }) {
  const { openEditForm } = useApp();
  const [adjustment, setAdjustment] = useState({
    quantity: 0,
    type: 'inbound',
    reason: '',
    reference: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setAdjustment(prev => ({
      ...prev,
      [name]: name === 'quantity' ? Number(value) : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const result = await adjustStock(item.id, adjustment);

      // Show success message
      alert(`Stock adjusted successfully!\nNew quantity: ${result.quantity}`);

      // Reset form
      setAdjustment({
        quantity: 0,
        type: 'inbound',
        reason: '',
        reference: ''
      });

      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to adjust stock');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen || !item) return null;

  const currentQuantity = item.quantity;
  const projectedQuantity = currentQuantity + adjustment.quantity;

  return (
    <div className="modal">
      <div className="modal-content">
        <h2>Stock Adjustment: {item.name}</h2>

        <div className="info">
          <span>Current Quantity: <strong>{currentQuantity}</strong></span>
          <span>Projected Quantity: <strong>{projectedQuantity}</strong></span>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Type Selection */}
          <div className="form-group">
            <label>Movement Type *</label>
            <select name="type" value={adjustment.type} onChange={handleChange}>
              <option value="inbound">📦 Inbound (Stock Received)</option>
              <option value="outbound">📤 Outbound (Stock Shipped)</option>
              <option value="damage">💔 Damage (Lost/Defective)</option>
              <option value="adjustment">📊 Adjustment (Count Correction)</option>
              <option value="return">🔄 Return (Customer Return)</option>
            </select>
          </div>

          {/* Quantity */}
          <div className="form-group">
            <label>Quantity Change *</label>
            <input
              type="number"
              name="quantity"
              value={adjustment.quantity}
              onChange={handleChange}
              placeholder="Positive for add, negative for remove"
              required
            />
            <small>
              {adjustment.type === 'inbound' && 'Enter positive number for received stock'}
              {adjustment.type === 'outbound' && 'Enter negative number for shipped stock'}
              {adjustment.type === 'damage' && 'Enter negative number'}
              {adjustment.type === 'return' && 'Enter positive number'}
              {adjustment.type === 'adjustment' && 'Enter positive or negative'}
            </small>
          </div>

          {/* Reason */}
          <div className="form-group">
            <label>Reason *</label>
            <textarea
              name="reason"
              value={adjustment.reason}
              onChange={handleChange}
              placeholder="Why is this adjustment being made?"
              required
            />
          </div>

          {/* Reference (Optional) */}
          <div className="form-group">
            <label>Reference (Optional)</label>
            <input
              type="text"
              name="reference"
              value={adjustment.reference}
              onChange={handleChange}
              placeholder="PO-123, RMA-456, SO-789, etc."
            />
            <small>Document number for tracking</small>
          </div>

          {/* Error */}
          {error && <div className="error-message">{error}</div>}

          {/* Warning for negative result */}
          {projectedQuantity < 0 && (
            <div className="warning">
              ⚠️ This adjustment would result in negative stock ({projectedQuantity})
            </div>
          )}

          {/* Buttons */}
          <div className="form-actions">
            <button type="button" onClick={onClose}>
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || projectedQuantity < 0 || !adjustment.reason}
            >
              {loading ? 'Processing...' : 'Record Movement'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
```

---

## Search Component

### Advanced Search with Filters

```javascript
// SearchBar.jsx
import { useState, useEffect } from 'react';
import { searchItems } from '@/api/itemsApi';

export default function SearchBar({ onResults }) {
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('');
  const [status, setStatus] = useState('active');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (query.length > 2) {
      performSearch();
    } else {
      setResults([]);
    }
  }, [query, category, status]);

  const performSearch = async () => {
    try {
      setLoading(true);
      const items = await searchItems(query, category, status);
      setResults(items);
      onResults(items);
    } catch (error) {
      console.error('Search failed:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="search-container">
      <input
        type="text"
        placeholder="Search by SKU, name, or description..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="search-input"
      />

      <select value={category} onChange={(e) => setCategory(e.target.value)}>
        <option value="">All Categories</option>
        <option value="Electronics">Electronics</option>
        <option value="Furniture">Furniture</option>
      </select>

      <select value={status} onChange={(e) => setStatus(e.target.value)}>
        <option value="active">Active</option>
        <option value="inactive">Inactive</option>
        <option value="discontinued">Discontinued</option>
      </select>

      {loading && <span className="loading">Searching...</span>}
      <span className="result-count">
        {results.length} results
      </span>
    </div>
  );
}
```

---

## Error Handling

### Global Error Boundary

```javascript
// ErrorBoundary.jsx
import { handleApiError } from '@/api/itemsApi';

export function withErrorHandling(asyncFn) {
  return async (...args) => {
    try {
      return await asyncFn(...args);
    } catch (error) {
      const apiError = handleApiError(error);
      console.error(`API Error [${apiError.status}]:`, apiError.message);
      
      if (apiError.errors?.length) {
        console.error('Validation errors:', apiError.errors);
      }
      
      throw apiError;
    }
  };
}

// Usage:
const safeDelete = withErrorHandling(async (id) => {
  await deleteItem(id);
});

try {
  await safeDelete(itemId);
} catch (error) {
  showToast(`Error: ${error.message}`, 'error');
}
```

---

## 🎯 Quick Start

1. **Import the API function**:
   ```javascript
   import { fetchItems, createItem } from '@/api/itemsApi';
   ```

2. **Use in component**:
   ```javascript
   const items = await fetchItems();
   ```

3. **Handle loading/error**:
   ```javascript
   try {
     const data = await fetchItems();
   } catch (error) {
     console.error('Failed:', error);
   }
   ```

4. **Update UI**:
   ```javascript
   setItems(data);
   ```

---

**Version**: 2.0.0  
**Last Updated**: August 24, 2024
