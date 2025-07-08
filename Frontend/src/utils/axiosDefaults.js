// src/api/axios.js
import axios from 'axios';
import i18n from '../i18n';

// Detect environment and set baseURL
const baseURL =
  import.meta.env.MODE === 'development'
    ? 'http://localhost:8000'
    : import.meta.env.VITE_BACKEND_URL;

// Global CSRF token (stored after fetch)
let csrfToken = null;

// Create a secure Axios instance
const secureAxios = axios.create({
  baseURL,
  withCredentials: true,
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json',
    'X-Requested-With': 'XMLHttpRequest',
  },
});

// Sync Accept-Language with i18next
i18n.on('languageChanged', (lng) => {
  secureAxios.defaults.headers.common['Accept-Language'] = lng;
});

// Helper to return current CSRF token (for debugging/testing if needed)
const getCSRFToken = () => csrfToken;

// Fetch CSRF token from backend
export const fetchCSRFToken = async () => {
  try {
    const res = await secureAxios.get('/api/csrf/');
    csrfToken = res.data?.csrfToken || null;

    if (!csrfToken) {
      console.warn('⚠️ CSRF token missing from /api/csrf/ response');
    }
  } catch (err) {
    console.error('❌ Failed to fetch CSRF token:', err);
  }
};

// Automatically attach CSRF token to unsafe methods
secureAxios.interceptors.request.use((config) => {
  const method = config.method?.toLowerCase();
  const safeMethods = ['get', 'head', 'options'];

  if (!safeMethods.includes(method)) {
    if (csrfToken) {
      config.headers['X-CSRFToken'] = csrfToken;
    } else {
      console.warn(`⚠️ No CSRF token available for ${method?.toUpperCase()} ${config.url}`);
    }
  }

  return config;
});

// Global response handler for common auth issues
secureAxios.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const url = error.config?.url;

    if (status === 403 && error.response?.data?.detail?.toLowerCase().includes('csrf')) {
      console.warn(`🚫 CSRF verification failed on: ${url}`);
    }

    if (status === 401) {
      console.warn(`🔒 Unauthorized (401) - Session expired for: ${url}`);
    }

    return Promise.reject(error);
  }
);

// Public Axios instance (no credentials or CSRF)
export const publicAxios = axios.create({
  baseURL,
  withCredentials: false,
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  },
});

export default secureAxios;
