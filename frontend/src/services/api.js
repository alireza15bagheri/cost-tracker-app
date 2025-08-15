// /home/alireza/cost-tracker/frontend/src/services/api.js
import axios from 'axios';
import { getAccessToken, setAccessToken, clearAccessToken } from './auth';
import { tryRefresh } from './auth';

// Prefer same-origin through Vite or Nginx. Build with: VITE_API_URL=/api/
const baseURL = import.meta.env.VITE_API_URL || '/api/';
const api = axios.create({ baseURL, withCredentials: true });

// Attach in-memory access token to every request
api.interceptors.request.use((config) => {
  const token = getAccessToken();
  if (token) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Coalesce concurrent refresh attempts
let refreshPromise = null;

// Refresh on 401 using the HttpOnly refresh cookie,
// but NEVER try to refresh when the failing request is itself an auth endpoint.
api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config || {};
    const status = error.response?.status;
    const url = original.url || '';

    // Only act on 401s
    if (status !== 401) return Promise.reject(error);

    // Do not attempt refresh on auth endpoints (prevents self-trigger loops)
    const isAuthEndpoint =
      url.includes('token/refresh') || url.includes('token/') || url.includes('logout');
    if (isAuthEndpoint) {
      return Promise.reject(error);
    }

    // Avoid multiple retries for the same request
    if (original._retry) {
      return Promise.reject(error);
    }
    original._retry = true;

    try {
      // Ensure only one refresh in flight
      if (!refreshPromise) {
        refreshPromise = tryRefresh(); // returns new access token or null
      }
      const newAccess = await refreshPromise;
      refreshPromise = null;

      if (newAccess) {
        setAccessToken(newAccess);
        original.headers = original.headers || {};
        original.headers.Authorization = `Bearer ${newAccess}`;
        return api(original);
      }
    } catch (_) {
      refreshPromise = null;
    }

    // Refresh failed -> clear and send to login (no loops)
    clearAccessToken();
    if (typeof window !== 'undefined' && window.location.pathname !== '/') {
      window.location.href = '/';
    }
    return Promise.reject(error);
  }
);

export default api;
export { getAccessToken, setAccessToken, clearAccessToken };
