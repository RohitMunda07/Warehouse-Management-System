import { NavLink } from 'react-router-dom';
import { useApp } from '../context/AppContext';

export default function BottomNav() {
  const { openAddForm } = useApp();

  return (
    <nav className="bottom-nav" aria-label="Primary mobile">
      <NavLink to="/" end className={({ isActive }) => 'bn-item' + (isActive ? ' active' : '')}>
        <i className="ti ti-layout-dashboard" aria-hidden="true" />
        Home
      </NavLink>
      <NavLink to="/inventory" className={({ isActive }) => 'bn-item' + (isActive ? ' active' : '')}>
        <i className="ti ti-package" aria-hidden="true" />
        Items
      </NavLink>
      <button type="button" className="bn-item bn-scan" onClick={openAddForm} aria-label="Add item">
        <i className="ti ti-scan" aria-hidden="true" />
        Scan
      </button>
      <NavLink to="/reports" className={({ isActive }) => 'bn-item' + (isActive ? ' active' : '')}>
        <i className="ti ti-chart-bar" aria-hidden="true" />
        Reports
      </NavLink>
      <NavLink to="/settings" className={({ isActive }) => 'bn-item' + (isActive ? ' active' : '')}>
        <i className="ti ti-dots" aria-hidden="true" />
        More
      </NavLink>
    </nav>
  );
}
