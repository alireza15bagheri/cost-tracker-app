// /home/alireza/cost-tracker/frontend/src/services/api.js
import axios from 'axios';

// Base config
const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/';
const api = axios.create({ baseURL });

// Request interceptor — attach access token
api.interceptors.request.use((config) => {
  // 24-hour session check
  const sessionStart = localStorage.getItem('session_start');
  const sessionLimit = 24 * 60 * 60 * 1000; // 24 hours
  const now = Date.now();

  if (sessionStart && now - sessionStart > sessionLimit) {
    localStorage.clear();
    window.location.href = '/login';
    return Promise.reject({ message: 'Session expired — please log in again.' });
  }

  // Attach access token
  const token = localStorage.getItem('access_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;

  return config;
});

// Response interceptor — handle token expiration
api.interceptors.response.use(
  res => res,
  async error => {
    const originalRequest = error.config;
    const isTokenExpired = error.response?.status === 401 &&
      error.response?.data?.code === 'token_not_valid';

    if (isTokenExpired && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const refresh = localStorage.getItem('refresh_token');
        const { data } = await axios.post(`${baseURL}token/refresh/`, { refresh });
        localStorage.setItem('access_token', data.access);
        originalRequest.headers.Authorization = `Bearer ${data.access}`;
        return api(originalRequest);
      } catch (refreshError) {
        localStorage.clear();
        window.location.href = '/';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default api;
