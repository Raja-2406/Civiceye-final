import axios from 'axios';

// In production, point to backend URL if specified; otherwise default to /api proxy
const API_BASE_URL = import.meta.env.VITE_API_URL
  ? `${import.meta.env.VITE_API_URL.replace(/\/$/, '')}/api`
  : '/api';

const api = axios.create({
  baseURL: API_BASE_URL,
});

// Intercept request to add JWT authorization token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('civiceye_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Intercept response to handle 401 unauthorized
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Optional: clear token if expired
    }
    return Promise.reject(error);
  }
);

export default api;
