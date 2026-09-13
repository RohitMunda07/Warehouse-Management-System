import axios from 'axios';

const API_BASE = (import.meta.env.VITE_API_URL || import.meta.env.REACT_APP_API_URL);

export const authClient = axios.create({
  baseURL: API_BASE,
  timeout: 15000,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

authClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('waretrack-token');

  if (token) {
    config.headers = {
      ...config.headers,
      Authorization: `Bearer ${token}`,
    };
  }

  return config;
});

function unwrapAuthResponse(response) {
  return response?.data || {};
}

export const registerUser = (payload) =>
  authClient.post('/users/register', payload).then((response) => unwrapAuthResponse(response));

export const loginUser = (payload) =>
  authClient.post('/users/login', payload).then((response) => unwrapAuthResponse(response));

export const logoutUser = () =>
  authClient.post('/users/logout').then((response) => unwrapAuthResponse(response));

export const getCurrentUser = () =>
  authClient.get('/users/me').then((response) => unwrapAuthResponse(response));
