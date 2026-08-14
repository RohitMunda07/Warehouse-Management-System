import { NavLink } from 'react-router-dom';

const NAV_ITEMS = [
  { to: '/', icon: 'ti-layout-dashboard', label: 'Dashboard', end: true },
  { to: '/inventory', icon: 'ti-package', label: 'Inventory' },
  { to: '/receiving', icon: 'ti-truck-loading', label: 'Receiving' },
  { to: '/shipping', icon: 'ti-truck-delivery', label: 'Shipping' },
  { to: '/reports', icon: 'ti-chart-bar', label: 'Reports' },
  { to: '/settings', icon: 'ti-settings', label: 'Settings' },
];

export default function Sidebar() {
  return (
    <nav className="sidebar" aria-label="Primary">
      <div className="brand">
        <i className="ti ti-box" aria-hidden="true" />
        WareTrack
      </div>
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
    </nav>
  );
}
