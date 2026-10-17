import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api',
  headers: { 'Content-Type': 'application/json' },
  timeout: 15000
});

let onUnauthorized = null;
let getToken = () => '';

export function configurarSesion({ tokenProvider, unauthorizedHandler }) {
  getToken = tokenProvider;
  onUnauthorized = unauthorizedHandler;
}

api.interceptors.request.use((config) => {
  const token = getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const esLogin = error.config?.url?.includes('/auth/login');
    if (error.response?.status === 401 && !esLogin && onUnauthorized) {
      onUnauthorized();
    }
    return Promise.reject(error);
  }
);

export const unwrap = (response) => response.data.data;

export const unwrapList = (response) => ({ data: response.data.data, meta: response.data.meta });

export default api;
