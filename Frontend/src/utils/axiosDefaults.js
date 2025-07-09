import axios from 'axios';
import i18n from '../i18n';

const baseURL =
  import.meta.env.MODE === 'development'
    ? 'http://localhost:8000'
    : 'https://livesignal.onrender.com';

const secureAxios = axios.create({
  baseURL,
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  },
});

// Set Accept-Language on language change
i18n.on('languageChanged', (lng) => {
  secureAxios.defaults.headers.common['Accept-Language'] = lng;
});

// 🔐 Set access token from localStorage
secureAxios.interceptors.request.use((config) => {
  const token = localStorage.getItem('access');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// 🔄 Handle expired access token with refresh
secureAxios.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      localStorage.getItem('refresh')
    ) {
      originalRequest._retry = true;
      try {
        const res = await axios.post(`${baseURL}/api/users/auth/refresh/`, {
          refresh: localStorage.getItem('refresh'),
        });
        const newAccess = res.data.access;
        localStorage.setItem('access', newAccess);
        originalRequest.headers.Authorization = `Bearer ${newAccess}`;
        return secureAxios(originalRequest);
      } catch {
        localStorage.removeItem('access');
        localStorage.removeItem('refresh');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default secureAxios;
