import axios from 'axios';

const API_BASE = (import.meta.env.VITE_API_URL || import.meta.env.REACT_APP_API_URL);

const client = axios.create({
  baseURL: API_BASE,
  timeout: 15000,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

client.interceptors.request.use((config) => {
  const token = localStorage.getItem('waretrack-token');

  if (token) {
    config.headers = {
      ...config.headers,
      Authorization: `Bearer ${token}`,
    };
  }

  return config;
});

function unwrapResponseData(response) {
  const payload = response?.data;
  if (payload && typeof payload === 'object' && 'data' in payload) {
    return payload.data;
  }
  return payload;
}

export const fetchShipments = () =>
  client.get('/shipments').then((response) => unwrapResponseData(response));

export const createShipment = (payload) =>
  client.post('/shipments', payload).then((response) => unwrapResponseData(response));

export const updateShipment = (id, payload) =>
  client.put(`/shipments/${id}`, payload).then((response) => unwrapResponseData(response));

export const deleteShipment = (id) =>
  client.delete(`/shipments/${id}`).then((response) => unwrapResponseData(response));
