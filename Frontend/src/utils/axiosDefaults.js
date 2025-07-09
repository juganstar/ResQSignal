import axios from 'axios';
import i18n from '../i18n';

const baseURL =
  import.meta.env.MODE === 'development'
    ? 'http://localhost:8000'
    : 'https://livesignal.onrender.com';

let accessToken = localStorage.getItem('access_token');
let refreshToken = localStorage.getItem('refresh_token');

const secureAxios = axios.create({
  baseURL,
  withCredentials: false,
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json',
    'X-Requested-With': 'XMLHttpRequest',
  },
});

// Update language on change
i18n.on('languageChanged', (lng) => {
  secureAxios.defaults.headers.common['Accept-Language'] = lng;
});

// Add access token to headers
secureAxios.interceptors.request.use((config) => {
  if (accessToken) {
    config.headers['Authorization'] = `Bearer ${accessToken}`;
  }
  return config;
});

// Handle token expiration and auto-refresh
secureAxios.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      refreshToken
    ) {
      originalRequest._retry = true;
      try {
        const res = await axios.post(`${baseURL}/api/users/auth/refresh/`, {
          refresh: refreshToken,
        });
        accessToken = res.data.access;
        localStorage.setItem('access_token', accessToken);
        originalRequest.headers['Authorization'] = `Bearer ${accessToken}`;
        return secureAxios(originalRequest);
      } catch (refreshError) {
        console.warn('🔐 Token refresh failed');
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export const loginAndStoreTokens = async (credentials) => {
  const res = await secureAxios.post('/api/users/auth/login/', credentials);
  accessToken = res.data.access;
  refreshToken = res.data.refresh;
  localStorage.setItem('access_token', accessToken);
  localStorage.setItem('refresh_token', refreshToken);
  return res;
};

export const logoutAndClearTokens = () => {
  accessToken = null;
  refreshToken = null;
  localStorage.removeItem('access_token');
  localStorage.removeItem('refresh_token');
};

export default secureAxios;
