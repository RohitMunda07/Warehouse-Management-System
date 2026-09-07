import { useEffect, useMemo, useState } from 'react';
import { getInventoryReports } from '../api/itemsApi';
import StatCard from '../components/StatCard';
import StatusBadge from '../components/StatusBadge';

const emptyReport = {
  overview: {
    totalItems: 0,
    totalQuantity: 0,
    totalValue: 0,
    lowStockCount: 0,
    categoryCount: 0,
  },
  stockHealth: {
    healthy: 0,
    watch: 0,
    reorder: 0,
  },
  byCategory: [],
  lowStock: [],
};

export default function Reports() {
  const [report, setReport] = useState(emptyReport);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;

    getInventoryReports()
      .then((data) => {
        if (active) {
          setReport(data || emptyReport);
        }
      })
      .catch(() => {
        if (active) {
          setError('Unable to load report data right now.');
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  const categoryMax = useMemo(() => {
    const values = (report.byCategory || []).map((item) => Number(item.totalValue || 0));
    return Math.max(...values, 1);
  }, [report.byCategory]);

  const totalValue = Number(report.overview?.totalValue || 0);

  return (
    <>
      <div className="page-head">
        <div>
          <h2>Reports</h2>
          <div className="sub">
            {loading ? 'Loading inventory report…' : 'Overall inventory performance and stock health'}
          </div>
        </div>
      </div>

      {error ? (
        <div className="panel">
          <p className="sub">{error}</p>
        </div>
      ) : (
        <>
          <div className="stat-grid">
            <StatCard label="Total SKUs" value={report.overview?.totalItems ?? 0} />
            <StatCard
              label="Units in stock"
              value={report.overview?.totalQuantity ?? 0}
              delta={`${report.overview?.lowStockCount ?? 0} low stock`}
              direction={report.overview?.lowStockCount ? 'down' : 'up'}
            />
            <StatCard
              label="Inventory value"
              value={`₹${totalValue.toLocaleString(undefined, { maximumFractionDigits: 0 })}`}
            />
            <StatCard
              label="Categories"
              value={report.overview?.categoryCount ?? 0}
              delta={report.overview?.categoryCount ? 'Active groups' : 'No categories'}
              direction="up"
            />
          </div>

          <div className="panel-row report-panel-row">
            <div className="panel">
              <h3>Category value</h3>
              {(!report.byCategory || report.byCategory.length === 0) && (
                <p className="sub">No category data available yet.</p>
              )}

              <div className="category-bars">
                {(report.byCategory || []).map((item) => {
                  const width = ((Number(item.totalValue || 0) / categoryMax) * 100).toFixed(1);
                  return (
                    <div className="category-row" key={item.category || item._id || 'uncategorized'}>
                      <div className="category-meta">
                        <span>{item.category || item._id || 'Uncategorized'}</span>
                        <small>{item.count || 0} SKUs</small>
                      </div>
                      <div className="category-bar-track">
                        <span className="category-bar" style={{ width: `${width}%` }} />
                      </div>
                      <strong>₹{Number(item.totalValue || 0).toLocaleString(undefined, { maximumFractionDigits: 0 })}</strong>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="panel">
              <h3>Stock health</h3>
              <div className="health-summary">
                <div className="score-box score-green">
                  <span className="score-label">Healthy</span>
                  <strong>{report.stockHealth?.healthy ?? 0}</strong>
                </div>
                <div className="score-box score-amber">
                  <span className="score-label">Watch</span>
                  <strong>{report.stockHealth?.watch ?? 0}</strong>
                </div>
                <div className="score-box score-red">
                  <span className="score-label">Reorder</span>
                  <strong>{report.stockHealth?.reorder ?? 0}</strong>
                </div>
              </div>
            </div>
          </div>

          <div className="panel-row report-panel-row">
            <div className="panel">
              <h3>Low stock alert</h3>
              {(!report.lowStock || report.lowStock.length === 0) ? (
                <p className="sub">No item is currently below its reorder threshold.</p>
              ) : (
                <div className="report-list">
                  {report.lowStock.map((item) => (
                    <div className="report-row" key={item.id || item._id || item.sku}>
                      <div>
                        <div className="item-name">{item.name}</div>
                        <div className="item-sku">{item.sku}</div>
                      </div>
                      <div className="qty-block">
                        <span>{item.quantity}</span>
                        <small>Qty</small>
                      </div>
                      <div className="qty-block">
                        <span>{item.reorderThreshold}</span>
                        <small>Reorder</small>
                      </div>
                      <StatusBadge
                        label={item.quantity <= item.reorderThreshold ? 'Reorder' : 'Watch'}
                        color={item.quantity <= item.reorderThreshold ? 'red' : 'amber'}
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="panel">
              <h3>Summary</h3>
              <div className="report-summary">
                <div>
                  <span className="summary-label">Low stock count</span>
                  <strong>{report.overview?.lowStockCount ?? 0}</strong>
                </div>
                <div>
                  <span className="summary-label">Avg. value per SKU</span>
                  <strong>
                    ₹{(
                      (report.overview?.totalValue ?? 0) /
                        Math.max(report.overview?.totalItems || 1, 1)
                    ).toLocaleString(undefined, { maximumFractionDigits: 0 })}
                  </strong>
                </div>
                <div>
                  <span className="summary-label">Active categories</span>
                  <strong>{report.overview?.categoryCount ?? 0}</strong>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
}
