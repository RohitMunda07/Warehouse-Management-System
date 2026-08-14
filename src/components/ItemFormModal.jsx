import { useEffect, useRef, useState } from 'react';
import { useApp } from '../context/AppContext';

const CATEGORIES = ['Fasteners', 'Packaging', 'Safety', 'Electronics', 'Tools'];

const emptyForm = {
  name: '',
  category: CATEGORIES[0],
  location: '',
  quantity: '',
  reorderThreshold: '',
  maxStock: '',
  unitCost: '',
  notes: '',
};

export default function ItemFormModal() {
  const { editingItem, closeForm, saveItem } = useApp();
  const [form, setForm] = useState(emptyForm);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const firstFieldRef = useRef(null);

  // Load the item being edited (or reset to blank for "add") whenever the
  // modal target changes.
  useEffect(() => {
    setForm(
      editingItem
        ? {
            name: editingItem.name,
            category: editingItem.category,
            location: editingItem.location,
            quantity: String(editingItem.quantity),
            reorderThreshold: String(editingItem.reorderThreshold),
            maxStock: String(editingItem.maxStock),
            unitCost: String(editingItem.unitCost),
            notes: editingItem.notes || '',
          }
        : emptyForm
    );
    setErrors({});
  }, [editingItem]);

  // Focus the first field on open, and let Escape close the modal.
  useEffect(() => {
    firstFieldRef.current?.focus();
    function handleKey(e) {
      if (e.key === 'Escape') closeForm();
    }
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [closeForm]);

  function update(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: undefined }));
  }

  function validate() {
    const e = {};
    if (!form.name.trim()) e.name = 'Enter an item name.';
    if (!form.category) e.category = 'Choose a category.';
    if (!form.location.trim()) e.location = 'Enter a bin location.';
    if (form.quantity === '' || isNaN(Number(form.quantity)) || Number(form.quantity) < 0) {
      e.quantity = 'Enter a starting quantity of 0 or more.';
    }
    if (form.reorderThreshold !== '' && (isNaN(Number(form.reorderThreshold)) || Number(form.reorderThreshold) < 0)) {
      e.reorderThreshold = 'Enter a valid number.';
    }
    if (form.maxStock !== '' && (isNaN(Number(form.maxStock)) || Number(form.maxStock) <= 0)) {
      e.maxStock = 'Enter a valid number greater than 0.';
    }
    if (form.unitCost !== '' && (isNaN(Number(form.unitCost)) || Number(form.unitCost) < 0)) {
      e.unitCost = 'Enter a valid cost.';
    }
    return e;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length) {
      setErrors(validationErrors);
      return;
    }
    setSubmitting(true);
    const payload = {
      name: form.name.trim(),
      category: form.category,
      location: form.location.trim(),
      quantity: Number(form.quantity),
      reorderThreshold: Number(form.reorderThreshold || 0),
      maxStock: Number(form.maxStock || Math.max(Number(form.quantity), 1)),
      unitCost: Number(form.unitCost || 0),
      notes: form.notes.trim(),
    };
    await saveItem(payload);
    setSubmitting(false);
  }

  return (
    <div
      className="overlay"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) closeForm();
      }}
    >
      <div className="modal" role="dialog" aria-modal="true" aria-labelledby="item-form-title">
        <div className="modal-head">
          <h3 id="item-form-title">{editingItem ? 'Edit item' : 'Add new item'}</h3>
          <button type="button" className="icon-btn" onClick={closeForm} aria-label="Close">
            <i className="ti ti-x" aria-hidden="true" />
          </button>
        </div>
        <p className="sub">Fields marked with * are required.</p>

        <form onSubmit={handleSubmit} noValidate>
          <div className="field">
            <label htmlFor="f-name">Item name *</label>
            <input
              id="f-name"
              ref={firstFieldRef}
              type="text"
              value={form.name}
              onChange={(e) => update('name', e.target.value)}
              placeholder="e.g. Hex bolt M8×40"
              className={errors.name ? 'error' : ''}
            />
            {errors.name && <div className="err">{errors.name}</div>}
          </div>

          <div className="grid2">
            <div className="field">
              <label htmlFor="f-sku">SKU</label>
              <input
                id="f-sku"
                className="mono"
                type="text"
                value={editingItem ? editingItem.sku : 'Generated on save'}
                readOnly
              />
              <div className="hint">Assigned automatically by the server.</div>
            </div>
            <div className="field">
              <label htmlFor="f-category">Category *</label>
              <select id="f-category" value={form.category} onChange={(e) => update('category', e.target.value)}>
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid2">
            <div className="field">
              <label htmlFor="f-location">Bin location *</label>
              <input
                id="f-location"
                type="text"
                value={form.location}
                onChange={(e) => update('location', e.target.value)}
                placeholder="e.g. A-14-B"
                className={errors.location ? 'error' : ''}
              />
              {errors.location && <div className="err">{errors.location}</div>}
            </div>
            <div className="field">
              <label htmlFor="f-quantity">Quantity on hand *</label>
              <input
                id="f-quantity"
                type="number"
                min="0"
                value={form.quantity}
                onChange={(e) => update('quantity', e.target.value)}
                className={errors.quantity ? 'error' : ''}
              />
              {errors.quantity && <div className="err">{errors.quantity}</div>}
            </div>
          </div>

          <div className="grid2">
            <div className="field">
              <label htmlFor="f-reorder">Reorder threshold</label>
              <input
                id="f-reorder"
                type="number"
                min="0"
                value={form.reorderThreshold}
                onChange={(e) => update('reorderThreshold', e.target.value)}
                placeholder="e.g. 50"
                className={errors.reorderThreshold ? 'error' : ''}
              />
              {errors.reorderThreshold && <div className="err">{errors.reorderThreshold}</div>}
            </div>
            <div className="field">
              <label htmlFor="f-cost">Unit cost</label>
              <input
                id="f-cost"
                type="number"
                min="0"
                step="0.01"
                value={form.unitCost}
                onChange={(e) => update('unitCost', e.target.value)}
                placeholder="0.00"
                className={errors.unitCost ? 'error' : ''}
              />
              {errors.unitCost && <div className="err">{errors.unitCost}</div>}
            </div>
          </div>

          <div className="field">
            <label htmlFor="f-notes">Notes</label>
            <textarea
              id="f-notes"
              rows="2"
              value={form.notes}
              onChange={(e) => update('notes', e.target.value)}
              placeholder="Supplier, packaging details, or handling notes"
            />
          </div>

          <div className="modal-foot">
            <button type="button" className="btn btn-secondary" onClick={closeForm}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={submitting}>
              <i className="ti ti-check" aria-hidden="true" />
              {submitting ? 'Saving…' : 'Save item'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
