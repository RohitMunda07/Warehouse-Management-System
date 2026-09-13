import { Outlet } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import Toast from './Toast';

export default function AuthLayout() {
  const { toast } = useApp();

  return (
    <div className="auth-layout">
      <Outlet />
      {toast && <Toast message={toast.message} type={toast.type} />}
    </div>
  );
}
