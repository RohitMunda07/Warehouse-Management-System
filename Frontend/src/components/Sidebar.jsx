import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const NAV_ITEMS = [
  { to: '/dashboard', icon: 'ti-layout-dashboard', label: 'Dashboard', end: true },
  { to: '/inventory', icon: 'ti-package', label: 'Inventory' },
  { to: '/shipping', icon: 'ti-truck-delivery', label: 'Shipping' },
  // { to: '/receiving', icon: 'ti-truck-loading', label: 'Receiving' },
  { to: '/reports', icon: 'ti-chart-bar', label: 'Reports' },
  // { to: '/settings', icon: 'ti-settings', label: 'Settings' },
];

export default function Sidebar() {
  const navigate = useNavigate();
  const { user, logout, authLoading } = useAuth();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <nav className="sidebar" aria-label="Primary">
      <div className="brand">
        <i className="ti ti-box" aria-hidden="true" />
        WareTrack
      </div>

      <div className="nav-links">
        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            className={({ isActive }) => 'nav-item' + (isActive ? ' active' : '')}
          >
            <i className={`ti ${item.icon}`} aria-hidden="true" />
            {item.label}
          </NavLink>
        ))}
      </div>

      <div className="sidebar-footer">
        <div className="sidebar-user">
          <i className="ti ti-user-circle" aria-hidden="true" />
          <span>{user?.fullname || user?.email || 'User'}</span>
        </div>

        <button
          type="button"
          className="logout-button"
          onClick={handleLogout}
          disabled={authLoading}
        >
          <i className="ti ti-logout" aria-hidden="true" />
          {authLoading ? 'Logging out...' : 'Logout'}
        </button>
      </div>
    </nav>
  );
}
