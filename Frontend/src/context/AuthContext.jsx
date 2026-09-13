import { createContext, useContext, useMemo, useState, useEffect } from 'react';
import { loginUser, logoutUser, registerUser } from '../api/authApi';

const AuthContext = createContext(null);

function readStoredUser() {
  const rawUser = localStorage.getItem('waretrack-user');
  if (!rawUser) return null;

  try {
    return JSON.parse(rawUser);
  } catch (error) {
    return null;
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(readStoredUser);
  const [token, setToken] = useState(() => localStorage.getItem('waretrack-token') || '');
  const [authLoading, setAuthLoading] = useState(false);

  useEffect(() => {
    if (user) {
      localStorage.setItem('waretrack-user', JSON.stringify(user));
    } else {
      localStorage.removeItem('waretrack-user');
    }
  }, [user]);

  useEffect(() => {
    if (token) {
      localStorage.setItem('waretrack-token', token);
    } else {
      localStorage.removeItem('waretrack-token');
    }
  }, [token]);

  const register = async (payload) => {
    setAuthLoading(true);

    try {
      const response = await registerUser(payload);
      return {
        success: true,
        message: response?.message || 'User registered successfully.',
      };
    } catch (error) {
      return {
        success: false,
        message: error?.response?.data?.message || 'Unable to create your account right now.',
      };
    } finally {
      setAuthLoading(false);
    }
  };

  const login = async (payload) => {
    setAuthLoading(true);

    try {
      const response = await loginUser(payload);
      const loggedInUser = response?.data?.user || response?.data || null;
      const accessToken = response?.data?.accessToken || '';

      setUser(loggedInUser);
      setToken(accessToken);

      return {
        success: true,
        message: response?.message || 'Logged in successfully.',
      };
    } catch (error) {
      return {
        success: false,
        message: error?.response?.data?.message || 'Invalid email or password.',
      };
    } finally {
      setAuthLoading(false);
    }
  };

  const logout = async () => {
    setAuthLoading(true);

    try {
      await logoutUser();
    } catch (error) {
      // Ignore server-side logout failures and clear the UI state anyway.
    } finally {
      setUser(null);
      setToken('');
      setAuthLoading(false);
    }
  };

  const value = useMemo(() => ({
    user,
    token,
    authLoading,
    isAuthenticated: Boolean(user || token),
    login,
    register,
    logout,
  }), [user, token, authLoading]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  return context;
}
