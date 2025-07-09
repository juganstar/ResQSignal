import axios from 'axios';
import i18n from '../i18n';

// ✅ Correct backend for Render
const baseURL =
  import.meta.env.MODE === 'development'
    ? 'http://localhost:8000'
    : 'https://livesignal.onrender.com';

// 🔐 Get CSRF token from cookie
const getCSRFTokenFromCookie = () => {
  const match = document.cookie
    .split('; ')
    .find(row => row.startsWith('csrftoken='));
  return match ? match.split('=')[1] : null;
};

// Secure Axios instance
const secureAxios = axios.create({
  baseURL,
  withCredentials: true,
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json',
    'X-Requested-With': 'XMLHttpRequest',
  },
});

// Sync Accept-Language header with i18n
i18n.on('languageChanged', (lng) => {
  secureAxios.defaults.headers.common['Accept-Language'] = lng;
});

// Attach CSRF to unsafe requests
secureAxios.interceptors.request.use((config) => {
  const method = config.method?.toLowerCase();
  const safeMethods = ['get', 'head', 'options'];

  if (!safeMethods.includes(method)) {
    const token = getCSRFTokenFromCookie();
    if (token) {
      config.headers['X-CSRFToken'] = token;
    } else {
      console.warn(`⚠️ No CSRF token in cookie for ${method?.toUpperCase()} ${config.url}`);
    }
  }

  return config;
});

// Handle common auth errors
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

// Public Axios (no credentials)
export const publicAxios = axios.create({
  baseURL,
  withCredentials: false,
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  },
});

export default secureAxios;
