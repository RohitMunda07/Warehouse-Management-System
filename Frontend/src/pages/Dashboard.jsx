import { useMemo } from 'react';
import { useApp } from '../context/AppContext';
import StatCard from '../components/StatCard';
import HealthBar from '../components/HealthBar';
import StatusBadge from '../components/StatusBadge';
import { getStockStatus } from '../utils/stock';

export default function Dashboard() {
  const { items, loading, openAddForm } = useApp();

  const stats = useMemo(() => {
    const lowStock = items.filter((it) => getStockStatus(it.quantity, it.reorderThreshold).status !== 'healthy');
    const value = items.reduce((sum, it) => sum + it.quantity * it.unitCost, 0);
    return { total: items.length, lowStock: lowStock.length, value };
  }, [items]);

  const lowestFirst = useMemo(() => {
    return [...items]
      .sort((a, b) => a.quantity / (a.maxStock || 1) - b.quantity / (b.maxStock || 1))
      .slice(0, 4);
  }, [items]);

  return (
    <>
      <div className="page-head">
        <div>
          <h2>Dashboard</h2>
          <div className="sub">{loading ? 'Loading inventory…' : `${items.length} items tracked`}</div>
        </div>
        <button className="btn btn-primary" onClick={openAddForm}>
          <i className="ti ti-plus" aria-hidden="true" />
          Add item
        </button>
      </div>

      {loading ? (
        <p className="sub">Loading dashboard…</p>
      ) : (
        <>
          <div className="stat-grid">
            <StatCard label="Total SKUs" value={stats.total} />
            <StatCard
              label="Low stock items"
              value={stats.lowStock}
              delta={stats.lowStock ? 'Needs reorder' : 'All healthy'}
              direction={stats.lowStock ? 'down' : 'up'}
            />
            <StatCard label="Pending shipments" value="—" delta="Connect a Shipping module" />
            <StatCard label="Inventory value" value={`₹${stats.value.toLocaleString(undefined, { maximumFractionDigits: 0 })}`} />
          </div>

          <div className="panel-row">
            <div className="panel">
              <h3>Stock health — lowest first</h3>
              {lowestFirst.length === 0 && <p className="sub">Add your first item to see stock health here.</p>}
              {lowestFirst.map((it) => {
                const s = getStockStatus(it.quantity, it.reorderThreshold);
                return (
                  <div className="health-row" key={it.id}>
                    <div>
                      <div className="name">{it.name}</div>
                      <div className="sku">{it.sku}</div>
                    </div>
                    <HealthBar quantity={it.quantity} maxStock={it.maxStock} color={s.color} />
                    <div className="qty">
                      {it.quantity} / {it.maxStock}
                    </div>
                    <StatusBadge label={s.label} color={s.color} />
                  </div>
                );
              })}
            </div>
            <div className="panel">
              <h3>Recent activity</h3>
              <p className="sub">
                This panel is ready to bind to a Movements collection in MongoDB (received, picked, adjusted) once
                that endpoint exists on your Express API — see the README for the suggested schema.
              </p>
            </div>
          </div>
        </>
      )}
    </>
  );
}
