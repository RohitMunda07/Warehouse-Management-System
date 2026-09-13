import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useApp } from '../context/AppContext';

const initialState = {
  fullname: '',
  email: '',
  phone: '',
  password: '',
};

export default function RegisterPage() {
  const navigate = useNavigate();
  const { register, authLoading } = useAuth();
  const { showToast } = useApp();
  const [formData, setFormData] = useState(initialState);
  const [error, setError] = useState('');

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (error) setError('');
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');

    const result = await register({
      fullname: formData.fullname.trim(),
      email: formData.email.trim(),
      phone: formData.phone.trim(),
      password: formData.password,
    });

    if (result.success) {
      showToast(result.message, 'success');
      navigate('/login');
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
        <h1>Build a stronger warehouse team</h1>
        <p>Create your account and start managing inventory, teams, and stock health with confidence.</p>
      </div>

      <div className="auth-panel auth-panel--form">
        <div className="auth-header-row">
          <h2>Create account</h2>
          <Link to="/landing" className="text-link">Back to home</Link>
        </div>

        <form className="auth-form" onSubmit={handleSubmit}>
          {error && <div className="auth-error-box">{error}</div>}

          <div className="field">
            <label htmlFor="register-name">Full name</label>
            <input
              id="register-name"
              type="text"
              name="fullname"
              value={formData.fullname}
              onChange={handleChange}
              placeholder="John Kepler"
              required
            />
          </div>

          <div className="field">
            <label htmlFor="register-email">Email</label>
            <input
              id="register-email"
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="name@company.com"
              required
            />
          </div>

          <div className="field">
            <label htmlFor="register-phone">Phone</label>
            <input
              id="register-phone"
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="+91 9876543210"
              required
            />
          </div>

          <div className="field">
            <label htmlFor="register-password">Password</label>
            <input
              id="register-password"
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Minimum 8 characters"
              minLength={8}
              required
            />
          </div>

          <button type="submit" className="btn btn-primary btn-block" disabled={authLoading}>
            {authLoading ? 'Creating account...' : 'Create account'}
          </button>
        </form>

        <p className="auth-footer">
          Already have an account? <Link to="/login">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
