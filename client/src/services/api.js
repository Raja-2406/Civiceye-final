import axios from 'axios';

// In production, point to backend URL if specified; otherwise default to /api proxy
const rawApiUrl = import.meta.env.VITE_API_URL;
let API_BASE_URL = '/api';

if (rawApiUrl) {
  let url = rawApiUrl.trim();

  // If Render passed an unexpanded template string like https://${BACKEND_HOST}.onrender.com
  if (url.includes('${')) {
    url = url.replace(/\$\{.*?\}/g, 'civiceye-api-k27d');
  }

  // If Render passed just the service slug (e.g. civiceye-api-k27d) without a dot/domain
  if (!url.includes('.') && !url.includes('localhost')) {
    url = `${url}.onrender.com`;
  }

  // Ensure https or http protocol
  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    url = `https://${url}`;
  }

  API_BASE_URL = `${url.replace(/\/$/, '')}/api`;
}

console.log('[CivicEye Client] API Base URL configured:', API_BASE_URL);

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
