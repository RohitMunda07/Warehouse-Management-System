import axios from 'axios';

// API Configuration
const API_BASE = (import.meta.env.VITE_API_URL || import.meta.env.REACT_APP_API_URL || 'http://localhost:8000/api/v1');

// Create axios instance with base config
const client = axios.create({ 
  baseURL: API_BASE,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
});

function unwrapResponseData(response) {
  const payload = response?.data;
  if (payload && typeof payload === 'object' && 'data' in payload) {
    return payload.data;
  }
  return payload;
}

/**
 * MongoDB documents come back with `_id`, not `id` — normalizing here once
 * means every component downstream can just use `item.id` and never has to
 * know or care that Mongo is involved. This prevents React key issues.
 */
function normalize(item) {
  if (!item) return item;

  const firstWarehouseStock = Array.isArray(item.warehouseStocks) ? item.warehouseStocks[0] : null;

  return {
    ...item,
    id: item.id || item._id,
    location: item.location || firstWarehouseStock?.binNumber || firstWarehouseStock?.location || '',
    unitCost: Number(item.unitCost ?? 0),
    quantity: Number(item.quantity ?? 0),
    reorderThreshold: Number(item.reorderThreshold ?? 0),
    maxStock: Number(item.maxStock ?? item.quantity ?? 1),
    notes: item.notes || '',
  };
}

/**
 * Normalize array of items
 */
function normalizeArray(items) {
  if (!Array.isArray(items)) return items;
  return items.map(normalize);
}

/* ========================================================================== */
/*                      BASIC ITEM CRUD OPERATIONS                           */
/* ========================================================================== */

/**
 * Fetch all active items
 * @returns {Promise<Array>} List of all active items
 * 
 * Backend: GET /api/items
 */
export const fetchItems = () =>
  client.get('/items')
    .then((res) => normalizeArray(unwrapResponseData(res)))
    .catch((error) => {
      console.error('Error fetching items:', error);
      throw error;
    });

/**
 * Get item by ID
 * @param {string} id - Item MongoDB ID
 * @returns {Promise<Object>} Item details
 * 
 * Backend: GET /api/items/:id
 */
export const getItemById = (id) =>
  client.get(`/items/${id}`)
    .then((res) => normalize(unwrapResponseData(res)))
    .catch((error) => {
      console.error(`Error fetching item ${id}:`, error);
      throw error;
    });

/**
 * Create new item
 * @param {Object} item - Item data
 * @returns {Promise<Object>} Created item with ID
 * 
 * Backend: POST /api/items
 */
export const createItem = (item) =>
  client.post('/items', item)
    .then((res) => normalize(unwrapResponseData(res)))
    .catch((error) => {
      console.error('Error creating item:', error);
      throw error;
    });

/**
 * Update existing item
 * @param {string} id - Item MongoDB ID
 * @param {Object} item - Updated item data (partial or full)
 * @returns {Promise<Object>} Updated item
 * 
 * Backend: PUT /api/items/:id
 */
export const updateItem = (id, item) =>
  client.put(`/items/${id}`, item)
    .then((res) => normalize(unwrapResponseData(res)))
    .catch((error) => {
      console.error(`Error updating item ${id}:`, error);
      throw error;
    });

/**
 * Delete item
 * @param {string} id - Item MongoDB ID
 * @returns {Promise<Object>} Deletion confirmation
 * 
 * Backend: DELETE /api/items/:id
 */
export const deleteItem = (id) =>
  client.delete(`/items/${id}`)
    .then((res) => unwrapResponseData(res))
    .catch((error) => {
      console.error(`Error deleting item ${id}:`, error);
      throw error;
    });

/* ========================================================================== */
/*                          SEARCH & FILTER                                  */
/* ========================================================================== */

/**
 * Search items with advanced filtering
 * @param {string} q - Search query (SKU, name, or description)
 * @param {string} category - Filter by category (optional)
 * @param {string} status - Filter by status: active/inactive/discontinued (optional)
 * @returns {Promise<Array>} Filtered items
 * 
 * Backend: GET /api/items/search?q=<query>&category=<cat>&status=<status>
 * 
 * Example:
 * searchItems('laptop', 'Electronics', 'active')
 * searchItems('SKU-123')
 */
export const searchItems = (q = '', category = '', status = 'active') => {
  const params = new URLSearchParams();
  if (q) params.append('q', q);
  if (category) params.append('category', category);
  if (status) params.append('status', status);
  
  return client.get(`/items/search?${params.toString()}`)
    .then((res) => normalizeArray(unwrapResponseData(res)))
    .catch((error) => {
      console.error('Error searching items:', error);
      throw error;
    });
};

/**
 * Get all items below reorder threshold
 * @returns {Promise<Array>} Low stock items sorted by quantity
 * 
 * Backend: GET /api/items/stock/low-stock
 * 
 * Use case: Display "Low Stock Alert" on dashboard
 */
export const getLowStockItems = () =>
  client.get('/items/stock/low-stock')
    .then((res) => normalizeArray(unwrapResponseData(res)))
    .catch((error) => {
      console.error('Error fetching low stock items:', error);
      throw error;
    });

/* ========================================================================== */
/*                        INVENTORY ANALYTICS                                */
/* ========================================================================== */

/**
 * Get comprehensive warehouse analytics
 * @returns {Promise<Object>} Warehouse statistics
 * 
 * Backend: GET /api/items/analytics/warehouse
 * 
 * Returns:
 * {
 *   totalItems: number,
 *   totalQuantity: number,
 *   totalValue: number,
 *   avgUnitCost: number,
 *   lowStockCount: number,
 *   overStockCount: number,
 *   topCategories: Array
 * }
 * 
 * Use case: Dashboard KPI cards
 */
export const getWarehouseAnalytics = () =>
  client.get('/items/analytics/warehouse')
    .then((res) => unwrapResponseData(res))
    .catch((error) => {
      console.error('Error fetching warehouse analytics:', error);
      throw error;
    });

/**
 * Get inventory value statistics
 * @returns {Promise<Object>} Total inventory value data
 * 
 * Backend: GET /api/items/analytics/inventory-value
 * 
 * Returns:
 * {
 *   totalValue: number,
 *   totalItems: number,
 *   totalQuantity: number
 * }
 * 
 * Use case: Inventory value card on dashboard
 */
export const getInventoryValue = () =>
  client.get('/items/analytics/inventory-value')
    .then((res) => unwrapResponseData(res))
    .catch((error) => {
      console.error('Error fetching inventory value:', error);
      throw error;
    });

/**
 * Get statistics grouped by category
 * @returns {Promise<Array>} Category breakdown with counts and values
 * 
 * Backend: GET /api/items/analytics/category
 * 
 * Returns array of:
 * {
 *   _id: string (category name),
 *   count: number,
 *   totalQuantity: number,
 *   totalValue: number,
 *   low: number (items below reorder)
 * }
 * 
 * Use case: Category breakdown chart
 */
export const getCategoryStats = () =>
  client.get('/items/analytics/category')
    .then((res) => unwrapResponseData(res))
    .catch((error) => {
      console.error('Error fetching category stats:', error);
      throw error;
    });

/* ========================================================================== */
/*                        STOCK MANAGEMENT                                   */
/* ========================================================================== */

/**
 * Adjust stock for an item (inbound/outbound/damage/adjustment/return)
 * @param {string} id - Item MongoDB ID
 * @param {Object} adjustment - Adjustment details
 * @param {number} adjustment.quantity - Quantity change (positive/negative)
 * @param {string} adjustment.reason - Reason for adjustment
 * @param {string} adjustment.reference - Optional: PO/SO number
 * @param {string} adjustment.type - Movement type: inbound|outbound|adjustment|damage|return
 * @returns {Promise<Object>} Updated item
 * 
 * Backend: POST /api/items/:id/adjust-stock
 * 
 * Usage Examples:
 * 
 * // Stock received from supplier
 * adjustStock(itemId, {
 *   quantity: 50,
 *   reason: 'Stock received from supplier',
 *   reference: 'PO-2024-001',
 *   type: 'inbound'
 * })
 * 
 * // Item damaged
 * adjustStock(itemId, {
 *   quantity: -5,
 *   reason: 'Damaged in warehouse',
 *   type: 'damage'
 * })
 * 
 * // Manual count correction
 * adjustStock(itemId, {
 *   quantity: 10,
 *   reason: 'Physical count adjustment',
 *   type: 'adjustment'
 * })
 * 
 * // Customer return
 * adjustStock(itemId, {
 *   quantity: 3,
 *   reason: 'Returned by customer',
 *   reference: 'RMA-12345',
 *   type: 'return'
 * })
 */
export const adjustStock = (id, adjustment) => {
  if (!id || !adjustment) {
    throw new Error('Item ID and adjustment data are required');
  }
  
  return client.post(`/items/${id}/adjust-stock`, adjustment)
    .then((res) => normalize(unwrapResponseData(res)))
    .catch((error) => {
      console.error(`Error adjusting stock for item ${id}:`, error);
      throw error;
    });
};

/* ========================================================================== */
/*                         ERROR HANDLING                                    */
/* ========================================================================== */

/**
 * Handle API errors
 * @param {Error} error - Error from API
 * @returns {Object} Formatted error
 */
export const handleApiError = (error) => {
  if (error.response?.data) {
    return {
      message: error.response.data.message || 'An error occurred',
      status: error.response.status,
      errors: error.response.data.errors || []
    };
  }
  return {
    message: error.message || 'Network error',
    status: 0,
    errors: []
  };
};

/**
 * Get inventory summary and analytics for the Reports module.
 * @returns {Promise<Object>} Overview, stock health, category totals, low-stock items
 *
 * Backend: GET /api/items/reports
 */
export const getInventoryReports = () =>
  client.get('/items/reports')
    .then((res) => unwrapResponseData(res))
    .catch((error) => {
      console.error('Error fetching inventory reports:', error);
      throw error;
    });

