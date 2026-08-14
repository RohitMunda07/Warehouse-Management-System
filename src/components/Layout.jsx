import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import BottomNav from './BottomNav';
import Toast from './Toast';
import ItemFormModal from './ItemFormModal';
import { useApp } from '../context/AppContext';

export default function Layout() {
  const { toast, isFormOpen } = useApp();

  return (
    <div className="app">
      <Sidebar />
      <main className="main" id="main-content">
        <Outlet />
      </main>
      <BottomNav />
      {isFormOpen && <ItemFormModal />}
      {toast && <Toast message={toast.message} type={toast.type} />}
    </div>
  );
}
