import axios from 'axios';
import i18n from '../i18n';

const baseURL =
  import.meta.env.MODE === 'development'
    ? 'http://localhost:8000'
    : 'https://livesignal.onrender.com';

let csrfToken = null;

const secureAxios = axios.create({
  baseURL,
  withCredentials: true,
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json',
    'X-Requested-With': 'XMLHttpRequest',
  },
});

i18n.on('languageChanged', (lng) => {
  secureAxios.defaults.headers.common['Accept-Language'] = lng;
});

export const getCSRFToken = () => csrfToken;

export const fetchCSRFToken = async () => {
  try {
    const res = await secureAxios.get('/csrf/');
    csrfToken = res.data?.csrfToken || document.cookie
      .split("; ")
      .find((row) => row.startsWith("csrftoken="))
      ?.split("=")[1];

    if (!csrfToken) {
      console.warn('⚠️ CSRF token missing from /csrf/ response and cookie.');
    }
  } catch (err) {
    console.error('❌ Failed to fetch CSRF token:', err);
  }
};

secureAxios.interceptors.request.use((config) => {
  const method = config.method?.toLowerCase();
  const safeMethods = ['get', 'head', 'options'];

  if (!safeMethods.includes(method) && csrfToken) {
    config.headers['X-CSRFToken'] = csrfToken;
  }

  return config;
});

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

export const publicAxios = axios.create({
  baseURL,
  withCredentials: false,
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  },
});

export default secureAxios;
