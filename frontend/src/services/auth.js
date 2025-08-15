// /home/alireza/cost-tracker/frontend/src/services/auth.js
import axios from 'axios';

const STORAGE_KEY = 'access_token';

let ACCESS_TOKEN = null;

export const setAccessToken = (token) => {
  ACCESS_TOKEN = token || null;
  try {
    if (token) {
      localStorage.setItem(STORAGE_KEY, token);
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  } catch {
    // ignore storage errors (e.g., SSR or disabled storage)
  }
};

export const getAccessToken = () => {
  if (ACCESS_TOKEN) return ACCESS_TOKEN;
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      ACCESS_TOKEN = stored;
      return stored;
    }
  } catch {
    // ignore
  }
  return null;
};

export const clearAccessToken = () => {
  ACCESS_TOKEN = null;
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // ignore
  }
};

// Use a clean axios client (no interceptors) for refresh to avoid recursion.
const baseURL = import.meta.env.VITE_API_URL || '/api/';
const refreshClient = axios.create({ baseURL, withCredentials: true });

/**
 * Try to refresh via HttpOnly refresh cookie.
 * Returns the new access token string on success, otherwise null.
 */
export async function tryRefresh() {
  try {
    const { data } = await refreshClient.post('token/refresh/', {});
    setAccessToken(data.access);
    return data.access;
  } catch {
    clearAccessToken();
    return null;
  }
}
