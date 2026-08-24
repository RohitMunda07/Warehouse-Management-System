import { useMemo, useState } from 'react';
import { useApp } from '../context/AppContext';
import HealthBar from '../components/HealthBar';
import StatusBadge from '../components/StatusBadge';
import { getStockStatus } from '../utils/stock';

const PAGE_SIZE = 5;

export default function Inventory() {
  const { items, loading, openAddForm, openEditForm, removeItem } = useApp();
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('all');
  const [stockStatus, setStockStatus] = useState('all');
  const [page, setPage] = useState(1);

  const categories = useMemo(() => ['all', ...new Set(items.map((it) => it.category))], [items]);

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    return items.filter((it) => {
      const matchesSearch = !term || it.name.toLowerCase().includes(term) || it.sku.toLowerCase().includes(term);
      const matchesCategory = category === 'all' || it.category === category;
      const status = getStockStatus(it.quantity, it.reorderThreshold).status;
      const matchesStatus = stockStatus === 'all' || status === stockStatus;
      return matchesSearch && matchesCategory && matchesStatus;
    });
  }, [items, search, category, stockStatus]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const paged = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  function handleDelete(item) {
    if (window.confirm(`Remove ${item.name} from inventory?`)) removeItem(item);
  }

  return (
    <>
      <div className="page-head">
        <div>
          <h2>Inventory</h2>
          <div className="sub">
            {filtered.length} of {items.length} items
          </div>
        </div>
        <button className="btn btn-primary" onClick={openAddForm}>
          <i className="ti ti-plus" aria-hidden="true" />
          Add item
        </button>
      </div>

      <div className="toolbar">
        <div className="search">
          <i className="ti ti-search" aria-hidden="true" />
          <input
            type="text"
            placeholder="Search by item name or SKU…"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            aria-label="Search inventory"
          />
        </div>
        <select
          value={category}
          onChange={(e) => {
            setCategory(e.target.value);
            setPage(1);
          }}
          aria-label="Filter by category"
        >
          {categories.map((c) => (
            <option key={c} value={c}>
              {c === 'all' ? 'All categories' : c}
            </option>
          ))}
        </select>
        <select
          value={stockStatus}
          onChange={(e) => {
            setStockStatus(e.target.value);
            setPage(1);
          }}
          aria-label="Filter by stock status"
        >
          <option value="all">All stock statuses</option>
          <option value="reorder">Reorder</option>
          <option value="watch">Watch</option>
          <option value="healthy">Healthy</option>
        </select>
      </div>

      {loading ? (
        <p className="sub">Loading inventory…</p>
      ) : (
        <>
          <table>
            <thead>
              <tr>
                <th>Item</th>
                <th>Category</th>
                <th>Location</th>
                <th>Stock health</th>
                <th>Quantity</th>
                <th>Unit cost</th>
                <th>Status</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {paged.length === 0 && (
                <tr>
                  <td colSpan="8" className="sub" style={{ padding: '20px 14px' }}>
                    No items match your search — try a different term or filter.
                  </td>
                </tr>
              )}
              {paged.map((it) => {
                const s = getStockStatus(it.quantity, it.reorderThreshold);
                return (
                  <tr key={it.id}>
                    <td>
                      <div className="item-name">{it.name}</div>
                      <div className="item-sku">{it.sku}</div>
                    </td>
                    <td>{it.category}</td>
                    <td>{it.location}</td>
                    <td>
                      <HealthBar quantity={it.quantity} maxStock={it.maxStock} color={s.color} width="60px" />
                    </td>
                    <td className="qty" style={{ textAlign: 'left' }}>
                      {it.quantity} units
                    </td>
                    <td className="qty" style={{ textAlign: 'left' }}>
                      ${it.unitCost.toFixed(2)}
                    </td>
                    <td>
                      <StatusBadge label={s.label} color={s.color} />
                    </td>
                    <td className="row-actions">
                      <button type="button" className="icon-btn" onClick={() => openEditForm(it)} aria-label={`Edit ${it.name}`}>
                        <i className="ti ti-edit" aria-hidden="true" />
                      </button>
                      <button type="button" className="icon-btn" onClick={() => handleDelete(it)} aria-label={`Remove ${it.name}`}>
                        <i className="ti ti-trash" aria-hidden="true" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          <div className="pager">
            <span>
              Showing {filtered.length === 0 ? 0 : (currentPage - 1) * PAGE_SIZE + 1}–
              {Math.min(currentPage * PAGE_SIZE, filtered.length)} of {filtered.length}
            </span>
            <span>
              <button
                type="button"
                className="icon-btn"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                aria-label="Previous page"
              >
                ‹
              </button>{' '}
              Page {currentPage} of {totalPages}{' '}
              <button
                type="button"
                className="icon-btn"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                aria-label="Next page"
              >
                ›
              </button>
            </span>
          </div>
        </>
      )}
    </>
  );
}
