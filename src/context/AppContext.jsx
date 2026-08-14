import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import * as api from '../api/itemsApi';
import { mockItems } from '../data/mockItems';

const AppContext = createContext(null);

export function AppProvider({ children }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [toast, setToast] = useState(null);
  const toastTimer = useRef(null);

  const showToast = useCallback((message, type = 'success') => {
    clearTimeout(toastTimer.current);
    setToast({ message, type });
    toastTimer.current = setTimeout(() => setToast(null), 4000);
  }, []);

  // Load items on mount. If there's no Express API running yet, fall back to
  // local demo data instead of leaving the whole app blank — but say so, so
  // "why don't my changes appear after I restart the app" isn't a mystery.
  useEffect(() => {
    let cancelled = false;
    api
      .fetchItems()
      .then((data) => {
        if (!cancelled) setItems(data);
      })
      .catch(() => {
        if (!cancelled) {
          setItems(mockItems);
          showToast('Backend not connected — showing local demo data.', 'error');
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [showToast]);

  const openAddForm = useCallback(() => {
    setEditingItem(null);
    setIsFormOpen(true);
  }, []);

  const openEditForm = useCallback((item) => {
    setEditingItem(item);
    setIsFormOpen(true);
  }, []);

  const closeForm = useCallback(() => {
    setIsFormOpen(false);
    setEditingItem(null);
  }, []);

  const saveItem = useCallback(
    async (formData) => {
      try {
        if (editingItem) {
          const updated = await api.updateItem(editingItem.id, formData);
          setItems((prev) => prev.map((it) => (it.id === editingItem.id ? updated : it)));
          showToast(`Item updated — ${formData.name}`, 'success');
        } else {
          const created = await api.createItem(formData);
          setItems((prev) => [created, ...prev]);
          showToast(`Item added — ${formData.name} (${created.sku})`, 'success');
        }
        closeForm();
        return true;
      } catch (err) {
        // No backend reachable yet (or it errored) — keep the UI usable by
        // applying the change locally, but be honest that it didn't persist.
        const fallback = {
          ...formData,
          id: editingItem ? editingItem.id : `itm-${Date.now()}`,
          sku: editingItem ? editingItem.sku : `SKU-${Math.floor(10000 + Math.random() * 89999)}`,
        };
        setItems((prev) =>
          editingItem ? prev.map((it) => (it.id === editingItem.id ? fallback : it)) : [fallback, ...prev]
        );
        showToast(`${editingItem ? 'Updated' : 'Added'} locally — backend not reachable.`, 'error');
        closeForm();
        return true;
      }
    },
    [editingItem, showToast, closeForm]
  );

  const removeItem = useCallback(
    async (item) => {
      const previous = items;
      setItems((prev) => prev.filter((it) => it.id !== item.id));
      try {
        await api.deleteItem(item.id);
        showToast(`Removed ${item.name}.`, 'success');
      } catch (err) {
        setItems(previous);
        showToast(`Couldn't remove ${item.name}. Try again.`, 'error');
      }
    },
    [items, showToast]
  );

  const value = {
    items,
    loading,
    isFormOpen,
    editingItem,
    toast,
    openAddForm,
    openEditForm,
    closeForm,
    saveItem,
    removeItem,
    showToast,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within an AppProvider');
  return ctx;
}
