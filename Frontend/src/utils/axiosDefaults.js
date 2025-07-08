import axios from 'axios';
import i18n from '../i18n';

// Detect environment and set baseURL
const baseURL =
  import.meta.env.MODE === 'development'
    ? 'http://localhost:8000'
    : import.meta.env.VITE_BACKEND_URL;

// Global CSRF token (fetched manually)
let csrfToken = null;

// Axios instance with secure defaults
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

// Get current CSRF token
const getCSRFToken = () => csrfToken;

// Fetch CSRF token manually from backend
export const fetchCSRFToken = async () => {
  try {
    const res = await secureAxios.get('/api/csrf/');
    csrfToken = res.data?.csrfToken || null;
    if (!csrfToken) {
      console.warn('⚠️ CSRF token missing from response');
    }
  } catch (err) {
    console.error('❌ Failed to fetch CSRF token', err);
  }
};

// Attach CSRF token to all unsafe requests
secureAxios.interceptors.request.use((config) => {
  const method = config.method?.toLowerCase();
  const safeMethods = ['get', 'head', 'options'];

  if (!safeMethods.includes(method)) {
    const token = getCSRFToken();
    if (token) {
      config.headers['X-CSRFToken'] = token;
    } else {
      console.warn('⚠️ No CSRF token available for request');
    }
  }

  return config;
});

// Handle auth errors globally
secureAxios.interceptors.response.use(
  (response) => response,
  (error) => {
    if (
      error.response?.status === 403 &&
      error.response?.data?.detail?.toLowerCase().includes('csrf')
    ) {
      console.warn('⚠️ CSRF verification failed:', error.config.url);
    }

    if (error.response?.status === 401) {
      console.warn('⚠️ Unauthorized (401): Session may have expired.');
    }

    return Promise.reject(error);
  }
);

// Public Axios (no credentials, for public APIs)
export const publicAxios = axios.create({
  baseURL,
  withCredentials: false,
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  },
});

export default secureAxios;
