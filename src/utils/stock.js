// Single source of truth for "what does this stock level mean" —
// the original HTML hardcoded a red/amber/green class on every row by hand,
// which is exactly how a dashboard and its table quietly drift out of sync.

export function getStockStatus(quantity, reorderThreshold) {
  const qty = Number(quantity) || 0;
  const threshold = Number(reorderThreshold) || 0;

  if (qty <= threshold) {
    return { status: 'reorder', label: 'Reorder', color: 'red' };
  }
  if (qty <= threshold * 2) {
    return { status: 'watch', label: 'Watch', color: 'amber' };
  }
  return { status: 'healthy', label: 'Healthy', color: 'green' };
}

export function getHealthPercent(quantity, maxStock) {
  const qty = Number(quantity) || 0;
  const max = Number(maxStock) || 0;
  if (max <= 0) return 0;
  const pct = (qty / max) * 100;
  return Math.max(0, Math.min(100, Math.round(pct)));
}
