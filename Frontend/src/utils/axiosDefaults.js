import axios from 'axios';
import i18n from '../i18n';

const baseURL =
  import.meta.env.MODE === 'development'
    ? 'http://localhost:8000'
    : 'https://livesignal.netlify.app/';

const secureAxios = axios.create({
  baseURL,
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  },
});

// 🌐 Update language header
i18n.on('languageChanged', (lng) => {
  secureAxios.defaults.headers.common['Accept-Language'] = lng;
});

// 🔐 Attach token to every request
secureAxios.interceptors.request.use((config) => {
  const token = localStorage.getItem('access');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// 🔄 Auto-refresh on 401
secureAxios.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const refresh = localStorage.getItem('refresh');

    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      refresh
    ) {
      originalRequest._retry = true;
      try {
        const res = await axios.post(`${baseURL}/api/users/auth/refresh/`, {
          refresh,
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
