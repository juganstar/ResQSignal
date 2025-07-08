// src/api/axios.js
import axios from 'axios';
import i18n from '../i18n';

// Detect environment and set baseURL
const baseURL =
  import.meta.env.MODE === 'development'
    ? 'http://localhost:8000'
    : import.meta.env.VITE_BACKEND_URL;

// CSRF token variable (fetched from backend)
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

// Helper to get current CSRF token
const getCSRFToken = () => csrfToken;

// Fetch CSRF token manually and store it
export const fetchCSRFToken = async () => {
  try {
    const res = await secureAxios.get('/api/csrf/');
    csrfToken = res.data?.csrfToken || null;
    if (!csrfToken) {
      console.warn('⚠️ CSRF token missing from /api/csrf/ response');
    }
  } catch (err) {
    console.error('❌ Failed to fetch CSRF token', err);
  }
};

// Attach CSRF token to all unsafe methods
secureAxios.interceptors.request.use((config) => {
  const method = config.method?.toLowerCase();
  const safeMethods = ['get', 'head', 'options'];

  if (!safeMethods.includes(method)) {
    if (csrfToken) {
      config.headers['X-CSRFToken'] = csrfToken;
    } else {
      console.warn(`⚠️ No CSRF token available for ${config.method?.toUpperCase()} ${config.url}`);
    }
  }

  return config;
});

// Handle 403 CSRF + 401 session expiration globally
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

// Public Axios (for anonymous/public endpoints)
export const publicAxios = axios.create({
  baseURL,
  withCredentials: false,
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  },
});

export default secureAxios;
