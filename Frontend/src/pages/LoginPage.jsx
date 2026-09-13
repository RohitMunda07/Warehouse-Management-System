import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useApp } from '../context/AppContext';

const initialState = {
  email: '',
  password: '',
};

export default function LoginPage() {
  const navigate = useNavigate();
  const { login, authLoading, isAuthenticated } = useAuth();
  const { showToast } = useApp();
  const [formData, setFormData] = useState(initialState);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (error) setError('');
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');

    const payload = {
      email: formData.email.trim(),
      password: formData.password,
    };

    const result = await login(payload);

    if (result.success) {
      showToast(result.message, 'success');
      navigate('/dashboard', { replace: true });
      return;
    }

    setError(result.message);
    showToast(result.message, 'error');
  };

  return (
    <div className="auth-page">
      <div className="auth-panel auth-panel--left">
        <div className="auth-brand">
          <i className="ti ti-box" aria-hidden="true" />
          WareTrack
        </div>
        <h1>Welcome back</h1>
        <p>Sign in to manage stock, monitor activity, and keep the warehouse moving.</p>
      </div>

      <div className="auth-panel auth-panel--form">
        <div className="auth-header-row">
          <h2>Login</h2>
          <Link to="/landing" className="text-link">Back to home</Link>
        </div>

        <form className="auth-form" onSubmit={handleSubmit}>
          {error && <div className="auth-error-box">{error}</div>}

          <div className="field">
            <label htmlFor="login-email">Email</label>
            <input
              id="login-email"
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="name@company.com"
              required
            />
          </div>

          <div className="field">
            <label htmlFor="login-password">Password</label>
            <input
              id="login-password"
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Enter your password"
              required
            />
          </div>

          <button type="submit" className="btn btn-primary btn-block" disabled={authLoading}>
            {authLoading ? 'Signing in...' : 'Sign in'}
          </button>
        </form>

        <p className="auth-footer">
          Don&apos;t have an account? <Link to="/register">Create one</Link>
        </p>
      </div>
    </div>
  );
}
