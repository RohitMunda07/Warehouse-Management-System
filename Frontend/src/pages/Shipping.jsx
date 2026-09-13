import { useEffect, useMemo, useState } from 'react';
import { useApp } from '../context/AppContext';
import { fetchShipments, createShipment } from '../api/shipmentsApi';

const STORAGE_KEY = 'waretrack-shipments';

const defaultShipments = [
  {
    id: 'SHIP-1001',
    itemName: 'Industrial Sensor',
    sku: 'SKU-2201',
    customer: 'Metro Supply Co.',
    destination: 'Chennai',
    quantity: 28,
    status: 'In Transit',
    shipmentDate: '2026-09-09',
    tracking: 'TRK-44218',
    notes: 'Priority dispatch for warehouse restock',
  },
  {
    id: 'SHIP-1002',
    itemName: 'Packaging Kit',
    sku: 'SKU-6102',
    customer: 'Northline Retail',
    destination: 'Hyderabad',
    quantity: 48,
    status: 'Delivered',
    shipmentDate: '2026-09-07',
    tracking: 'TRK-81342',
    notes: 'Delivered to retail outlet',
  },
  {
    id: 'SHIP-1003',
    itemName: 'Forklift Battery',
    sku: 'SKU-8804',
    customer: 'LogiFlex Services',
    destination: 'Pune',
    quantity: 14,
    status: 'Packed',
    shipmentDate: '2026-09-12',
    tracking: 'TRK-19270',
    notes: 'Awaiting final dispatch approval',
  },
];

function readStoredShipments() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultShipments;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length ? parsed : defaultShipments;
  } catch (error) {
    return defaultShipments;
  }
}

const emptyForm = {
  itemName: '',
  sku: '',
  customer: '',
  destination: '',
  quantity: '1',
  status: 'Packed',
  tracking: '',
  shipmentDate: new Date().toISOString().slice(0, 10),
  notes: '',
};

export default function Shipping() {
  const { items, showToast } = useApp();
  const [shipments, setShipments] = useState(readStoredShipments);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [form, setForm] = useState(emptyForm);

  useEffect(() => {
    const loadShipments = async () => {
      try {
        const response = await fetchShipments();
        const list = Array.isArray(response) ? response : [];
        if (list.length) {
          setShipments(list.map((entry) => ({
            id: entry._id || entry.id,
            itemName: entry.itemName,
            sku: entry.sku,
            customer: entry.customer,
            destination: entry.destination,
            quantity: Number(entry.quantity || 0),
            status: entry.status,
            shipmentDate: entry.shipmentDate ? new Date(entry.shipmentDate).toISOString().slice(0, 10) : '',
            tracking: entry.tracking,
            notes: entry.notes,
          })));
          localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
        }
      } catch (error) {
        setShipments(readStoredShipments());
      }
    };

    loadShipments();
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(shipments));
  }, [shipments]);

  const statuses = useMemo(() => ['all', 'Packed', 'In Transit', 'Delivered', 'Delayed'], []);

  const filteredShipments = useMemo(() => {
    const term = search.trim().toLowerCase();
    return shipments.filter((entry) => {
      const matchesSearch = !term || [entry.itemName, entry.customer, entry.destination, entry.tracking, entry.sku]
        .join(' ')
        .toLowerCase()
        .includes(term);
      const matchesStatus = statusFilter === 'all' || entry.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [shipments, search, statusFilter]);

  const summary = useMemo(() => {
    const totalShipped = shipments.reduce((sum, entry) => sum + Number(entry.quantity || 0), 0);
    const delivered = shipments.filter((entry) => entry.status === 'Delivered').length;
    const inTransit = shipments.filter((entry) => entry.status === 'In Transit').length;
    return { totalShipped, delivered, inTransit };
  }, [shipments]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const itemName = form.itemName.trim();
    const customer = form.customer.trim();
    const destination = form.destination.trim();
    const quantity = Number(form.quantity || 0);

    if (!itemName || !customer || !destination || !quantity) {
      window.alert('Please fill in the item name, customer, destination, and quantity.');
      return;
    }

    const payload = {
      itemName,
      sku: form.sku.trim() || `SHIP-${Math.random().toString(36).slice(2, 8).toUpperCase()}`,
      customer,
      destination,
      quantity,
      status: form.status,
      shipmentDate: form.shipmentDate,
      tracking: form.tracking.trim() || `TRK-${Math.random().toString(36).slice(2, 8).toUpperCase()}`,
      notes: form.notes.trim(),
    };

    try {
      const saved = await createShipment(payload);
      const normalized = {
        id: saved?._id || saved?.id || `SHIP-${Date.now().toString().slice(-6)}`,
        itemName: saved?.itemName || payload.itemName,
        sku: saved?.sku || payload.sku,
        customer: saved?.customer || payload.customer,
        destination: saved?.destination || payload.destination,
        quantity: Number(saved?.quantity || payload.quantity),
        status: saved?.status || payload.status,
        shipmentDate: saved?.shipmentDate ? new Date(saved.shipmentDate).toISOString().slice(0, 10) : payload.shipmentDate,
        tracking: saved?.tracking || payload.tracking,
        notes: saved?.notes || payload.notes,
      };

      setShipments((prev) => [normalized, ...prev]);
      setForm(emptyForm);
      showToast('Shipment saved to database.', 'success');
    } catch (error) {
      const fallback = {
        id: `SHIP-${Date.now().toString().slice(-6)}`,
        ...payload,
      };

      setShipments((prev) => [fallback, ...prev]);
      setForm(emptyForm);
      showToast('Saved locally — backend shipping route is unavailable.', 'error');
    }
  };

  return (
    <>
      <div className="page-head">
        <div>
          <h2>Shipping</h2>
          <div className="sub">Track outbound shipment records and delivery progress.</div>
        </div>
      </div>

      <div className="stat-grid">
        <div className="stat-card">
          <div className="label">Units shipped</div>
          <div className="value">{summary.totalShipped}</div>
          <div className="delta up">Total dispatched</div>
        </div>
        <div className="stat-card">
          <div className="label">Delivered</div>
          <div className="value">{summary.delivered}</div>
          <div className="delta up">Completed shipments</div>
        </div>
        <div className="stat-card">
          <div className="label">In transit</div>
          <div className="value">{summary.inTransit}</div>
          <div className="delta">Current movement</div>
        </div>
      </div>

      <div className="panel shipping-panel">
        <h3>Record shipment</h3>
        <form className="shipping-form" onSubmit={handleSubmit}>
          <div className="grid2">
            <div className="field">
              <label htmlFor="itemName">Item</label>
              <input
                id="itemName"
                name="itemName"
                value={form.itemName}
                onChange={handleChange}
                list="shipping-item-list"
                placeholder="Item name"
                required
              />
              <datalist id="shipping-item-list">
                {items.map((item) => (
                  <option key={item.id} value={item.name} />
                ))}
              </datalist>
            </div>
            <div className="field">
              <label htmlFor="sku">SKU</label>
              <input id="sku" name="sku" value={form.sku} onChange={handleChange} placeholder="Optional SKU" />
            </div>
          </div>

          <div className="grid2">
            <div className="field">
              <label htmlFor="customer">Customer</label>
              <input id="customer" name="customer" value={form.customer} onChange={handleChange} placeholder="Customer name" required />
            </div>
            <div className="field">
              <label htmlFor="destination">Destination</label>
              <input id="destination" name="destination" value={form.destination} onChange={handleChange} placeholder="City / warehouse" required />
            </div>
          </div>

          <div className="grid2">
            <div className="field">
              <label htmlFor="quantity">Quantity</label>
              <input id="quantity" name="quantity" type="number" min="1" value={form.quantity} onChange={handleChange} required />
            </div>
            <div className="field">
              <label htmlFor="status">Status</label>
              <select id="status" name="status" value={form.status} onChange={handleChange}>
                <option>Packed</option>
                <option>In Transit</option>
                <option>Delivered</option>
                <option>Delayed</option>
              </select>
            </div>
          </div>

          <div className="grid2">
            <div className="field">
              <label htmlFor="shipmentDate">Shipment date</label>
              <input id="shipmentDate" name="shipmentDate" type="date" value={form.shipmentDate} onChange={handleChange} required />
            </div>
            <div className="field">
              <label htmlFor="tracking">Tracking ID</label>
              <input id="tracking" name="tracking" value={form.tracking} onChange={handleChange} placeholder="Optional tracking" />
            </div>
          </div>

          <div className="field">
            <label htmlFor="notes">Notes</label>
            <textarea id="notes" name="notes" rows="3" value={form.notes} onChange={handleChange} placeholder="Special handling or delivery details" />
          </div>

          <div className="modal-foot">
            <button type="submit" className="btn btn-primary">Save shipment</button>
          </div>
        </form>
      </div>

      <div className="toolbar shipping-toolbar">
        <div className="search">
          <i className="ti ti-search" aria-hidden="true" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search shipment, customer, tracking…"
            aria-label="Search shipping records"
          />
        </div>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} aria-label="Filter by shipment status">
          {statuses.map((status) => (
            <option key={status} value={status}>
              {status === 'all' ? 'All shipment statuses' : status}
            </option>
          ))}
        </select>
      </div>

      <div className="panel">
        <h3>Shipment records</h3>
        <table>
          <thead>
            <tr>
              <th>Shipment</th>
              <th>Item</th>
              <th>Customer</th>
              <th>Destination</th>
              <th>Qty</th>
              <th>Date</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {filteredShipments.length === 0 && (
              <tr>
                <td colSpan="7" className="sub" style={{ padding: '20px 14px' }}>
                  No shipping records match your current filters.
                </td>
              </tr>
            )}
            {filteredShipments.map((entry) => (
              <tr key={entry.id}>
                <td>
                  <div className="item-name">{entry.id}</div>
                  <div className="item-sku">{entry.tracking}</div>
                </td>
                <td>
                  <div className="item-name">{entry.itemName}</div>
                  <div className="item-sku">{entry.sku}</div>
                </td>
                <td>{entry.customer}</td>
                <td>{entry.destination}</td>
                <td>{entry.quantity}</td>
                <td>{entry.shipmentDate}</td>
                <td>
                  <span className={`badge ${
                    entry.status === 'Delivered'
                      ? 'badge-green'
                      : entry.status === 'Delayed'
                        ? 'badge-red'
                        : 'badge-amber'
                  }`}>
                    {entry.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
