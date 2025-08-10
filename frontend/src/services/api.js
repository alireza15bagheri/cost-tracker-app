import axios from 'axios';

// For Vite, env vars must start with VITE_
const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/';

const api = axios.create({ baseURL });

// Attach token automatically
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default api;
