// /home/alireza/cost-tracker/frontend/src/services/auth.js
import axios from 'axios';

// Legacy key cleanup (from older versions that used localStorage)
const LEGACY_STORAGE_KEY = 'access_token';
try {
  if (typeof window !== 'undefined' && window.localStorage) {
    window.localStorage.removeItem(LEGACY_STORAGE_KEY);
  }
} catch {
  // ignore
}

// In-memory only access token (no localStorage/sessionStorage)
let ACCESS_TOKEN = null;

export const setAccessToken = (token) => {
  ACCESS_TOKEN = token || null;
  // Extra safety: ensure no legacy key lingers
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.removeItem(LEGACY_STORAGE_KEY);
    }
  } catch {
    // ignore
  }
};

export const getAccessToken = () => {
  return ACCESS_TOKEN;
};

export const clearAccessToken = () => {
  ACCESS_TOKEN = null;
  // Extra safety: ensure no legacy key lingers
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.removeItem(LEGACY_STORAGE_KEY);
    }
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
