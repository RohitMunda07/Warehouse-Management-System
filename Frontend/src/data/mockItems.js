// Fallback data only. Once REACT_APP_API_URL points at a running Express API,
// AppContext fetches real items and this file is never read.
export const mockItems = [
  { id: 'itm-1', sku: 'SKU-10234', name: 'Hex bolt M8×40', category: 'Fasteners', location: 'A-14-B', quantity: 14, reorderThreshold: 50, maxStock: 200, unitCost: 0.08, notes: '' },
  { id: 'itm-2', sku: 'SKU-88213', name: 'Packing tape, clear', category: 'Packaging', location: 'B-02-A', quantity: 42, reorderThreshold: 75, maxStock: 150, unitCost: 2.10, notes: '' },
  { id: 'itm-3', sku: 'SKU-55391', name: 'Nitrile gloves, L', category: 'Safety', location: 'C-08-C', quantity: 110, reorderThreshold: 60, maxStock: 200, unitCost: 6.40, notes: '' },
  { id: 'itm-4', sku: 'SKU-30044', name: 'Corrugate box, 12×12', category: 'Packaging', location: 'B-01-D', quantity: 328, reorderThreshold: 80, maxStock: 400, unitCost: 0.55, notes: '' },
  { id: 'itm-5', sku: 'SKU-71120', name: 'Pallet wrap, 20"', category: 'Packaging', location: 'B-03-A', quantity: 96, reorderThreshold: 30, maxStock: 105, unitCost: 14.20, notes: '' },
  { id: 'itm-6', sku: 'SKU-40217', name: 'Safety goggles', category: 'Safety', location: 'C-09-A', quantity: 18, reorderThreshold: 20, maxStock: 80, unitCost: 3.75, notes: '' },
  { id: 'itm-7', sku: 'SKU-90031', name: 'USB barcode scanner', category: 'Electronics', location: 'D-01-A', quantity: 6, reorderThreshold: 4, maxStock: 20, unitCost: 42.00, notes: '' },
  { id: 'itm-8', sku: 'SKU-12987', name: 'Cordless drill', category: 'Tools', location: 'D-04-C', quantity: 11, reorderThreshold: 5, maxStock: 15, unitCost: 89.99, notes: '' },
];
