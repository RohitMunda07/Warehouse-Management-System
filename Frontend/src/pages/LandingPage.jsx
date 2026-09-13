import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function LandingPage() {
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <div className="landing-shell">
      <header className="landing-header">
        <div className="landing-brand">
          <i className="ti ti-box" aria-hidden="true" />
          WareTrack
        </div>

        {isAuthenticated ? (
          <div className="landing-actions">
            <span className="landing-user">Hi, {user?.fullname || 'there'}</span>
            <button type="button" className="btn btn-primary" onClick={() => navigate('/dashboard')}>
              Open App
            </button>
            <button type="button" className="btn btn-secondary" onClick={handleLogout}>
              Logout
            </button>
          </div>
        ) : (
          <div className="landing-actions">
            <Link to="/login" className="btn btn-secondary">Login</Link>
            <Link to="/register" className="btn btn-primary">Create account</Link>
          </div>
        )}
      </header>

      <main className="landing-hero">
        <section className="landing-copy">
          <span className="eyebrow">Warehouse operations</span>
          <h1>Keep every shipment, stock level, and warehouse decision in one place.</h1>
          <p>
            WareTrack helps teams monitor inventory, reduce stockouts, and move faster with a cleaner, more dependable
            workflow across the warehouse floor.
          </p>

          <div className="cta-row">
            <Link to="/register" className="btn btn-primary btn-large">Get started</Link>
            <Link to="/login" className="btn btn-secondary btn-large">Sign in</Link>
          </div>

          <div className="metrics-row">
            <div>
              <strong>96%</strong>
              <span>On-time inventory updates</span>
            </div>
            <div>
              <strong>2.4x</strong>
              <span>Faster stock checks</span>
            </div>
            <div>
              <strong>24/7</strong>
              <span>Warehouse visibility</span>
            </div>
          </div>
        </section>

        <aside className="landing-card">
          <div className="mini-panel">
            <p>Inventory health</p>
            <h3>87.4%</h3>
            <div className="mini-bars">
              <span style={{ width: '92%' }} />
              <span style={{ width: '81%' }} />
              <span style={{ width: '68%' }} />
            </div>
          </div>

          <div className="mini-panel small">
            <div className="mini-row">
              <span>Stock status</span>
              <strong>Healthy</strong>
            </div>
            <div className="mini-row">
              <span>Low stock alerts</span>
              <strong>12 items</strong>
            </div>
            <div className="mini-row">
              <span>Pending dispatch</span>
              <strong>8 orders</strong>
            </div>
          </div>
        </aside>
      </main>
    </div>
  );
}
