import dotenv from "dotenv";
import mongoose from "mongoose";
import { ItemModel } from "../src/models/Item.model.js";

dotenv.config();

const sampleItems = [
  { sku: 'SKU-10234', name: 'Hex bolt M8×40', category: 'Fasteners', location: 'A-14-B', quantity: 14, reorderThreshold: 50, maxStock: 200, unitCost: 0.08, notes: 'Warehouse fastener stock.' },
  { sku: 'SKU-88213', name: 'Packing tape, clear', category: 'Packaging', location: 'B-02-A', quantity: 42, reorderThreshold: 75, maxStock: 150, unitCost: 2.10, notes: 'Shipping and packing tape.' },
  { sku: 'SKU-55391', name: 'Nitrile gloves, L', category: 'Safety', location: 'C-08-C', quantity: 110, reorderThreshold: 60, maxStock: 200, unitCost: 6.40, notes: 'Safety gloves for operations.' },
  { sku: 'SKU-30044', name: 'Corrugate box, 12×12', category: 'Packaging', location: 'B-01-D', quantity: 328, reorderThreshold: 80, maxStock: 400, unitCost: 0.55, notes: 'Packaging carton stock.' },
  { sku: 'SKU-71120', name: 'Pallet wrap, 20"', category: 'Packaging', location: 'B-03-A', quantity: 96, reorderThreshold: 30, maxStock: 105, unitCost: 14.20, notes: 'Stretch wrap for pallet handling.' },
  { sku: 'SKU-40217', name: 'Safety goggles', category: 'Safety', location: 'C-09-A', quantity: 18, reorderThreshold: 20, maxStock: 80, unitCost: 3.75, notes: 'Protective gear.' },
  { sku: 'SKU-90031', name: 'USB barcode scanner', category: 'Electronics', location: 'D-01-A', quantity: 6, reorderThreshold: 4, maxStock: 20, unitCost: 42.00, notes: 'Scanner for receiving.' },
  { sku: 'SKU-12987', name: 'Cordless drill', category: 'Tools', location: 'D-04-C', quantity: 11, reorderThreshold: 5, maxStock: 15, unitCost: 89.99, notes: 'General maintenance tool.' },
  { sku: 'SKU-50118', name: 'Steel anchor bolts', category: 'Fasteners', location: 'A-09-B', quantity: 74, reorderThreshold: 35, maxStock: 120, unitCost: 1.90, notes: 'Structural fastening stock.' },
  { sku: 'SKU-77142', name: 'Industrial labels', category: 'Office', location: 'E-02-A', quantity: 210, reorderThreshold: 100, maxStock: 300, unitCost: 0.60, notes: 'General office and warehouse labels.' },
  { sku: 'SKU-66073', name: 'Heavy-duty gloves', category: 'Safety', location: 'C-05-B', quantity: 33, reorderThreshold: 25, maxStock: 90, unitCost: 7.80, notes: 'Heavy-duty hand protection.' },
  { sku: 'SKU-23044', name: 'A4 shipping labels', category: 'Packaging', location: 'B-10-C', quantity: 160, reorderThreshold: 60, maxStock: 220, unitCost: 1.20, notes: 'Shipping label roll stock.' },
  { sku: 'SKU-18409', name: 'Laser measuring tool', category: 'Tools', location: 'D-06-D', quantity: 9, reorderThreshold: 7, maxStock: 25, unitCost: 58.50, notes: 'Precision measuring equipment.' },
  { sku: 'SKU-89011', name: 'Warehouse pallet jack', category: 'Equipment', location: 'F-01-A', quantity: 4, reorderThreshold: 3, maxStock: 12, unitCost: 420.00, notes: 'Forklift-assist equipment.' },
  { sku: 'SKU-33328', name: 'Lubricant spray', category: 'Maintenance', location: 'E-08-C', quantity: 68, reorderThreshold: 20, maxStock: 150, unitCost: 12.40, notes: 'Machine maintenance supply.' },
  { sku: 'SKU-77621', name: 'Stainless steel screws', category: 'Fasteners', location: 'A-12-D', quantity: 22, reorderThreshold: 40, maxStock: 180, unitCost: 0.26, notes: 'Corrosion-resistant screws.' },
];

async function seedItems() {
  const mongoUri = process.env.MONGODB_URI;

  if (!mongoUri) {
    throw new Error('MONGODB_URI is not defined in the environment');
  }

  await mongoose.connect(mongoUri, {
    serverSelectionTimeoutMS: 15000,
    connectTimeoutMS: 15000,
    socketTimeoutMS: 45000,
  });

  console.log('Connected to MongoDB');

  for (const item of sampleItems) {
    const payload = {
      sku: item.sku,
      name: item.name,
      category: item.category,
      description: item.notes,
      quantity: Number(item.quantity || 0),
      unit: 'piece',
      warehouseStocks: [
        {
          location: 'aisle_a',
          quantity: Number(item.quantity || 0),
          binNumber: item.location || 'MAIN'
        }
      ],
      unitCost: Number(item.unitCost || 0),
      sellingPrice: Number((Number(item.unitCost || 0) * 1.45).toFixed(2)),
      reorderThreshold: Number(item.reorderThreshold || 0),
      maxStock: Number(item.maxStock || 0),
      safetyStock: Math.max(0, Math.round(Number(item.reorderThreshold || 0) * 0.5)),
      status: 'active',
      notes: item.notes || '',
      stockMovements: [],
      tags: [item.category.toLowerCase()],
      lastRestocked: new Date(),
    };

    await ItemModel.updateOne(
      { sku: payload.sku },
      { $setOnInsert: payload },
      { upsert: true }
    );

    console.log(`Upserted ${payload.sku} (${payload.name})`);
  }

  const count = await ItemModel.countDocuments({ status: 'active' });
  console.log(`Seed complete. Total active items in DB: ${count}`);
  await mongoose.disconnect();
}

seedItems()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Seed failed:', error);
    process.exit(1);
  });
