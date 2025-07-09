import axios from 'axios';
import i18n from '../i18n';

const baseURL =
  import.meta.env.MODE === 'development'
    ? 'http://localhost:8000'
    : 'https://livesignal.onrender.com';

// Create axios instance
const secureAxios = axios.create({
  baseURL,
  withCredentials: true,
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json',
    'X-Requested-With': 'XMLHttpRequest',
  },
});

// 🔄 Add Accept-Language on language switch
i18n.on('languageChanged', (lng) => {
  secureAxios.defaults.headers.common['Accept-Language'] = lng;
});

// 🔐 Attach access token to every request
secureAxios.interceptors.request.use((config) => {
  const accessToken = localStorage.getItem('access_token');
  if (accessToken) {
    config.headers['Authorization'] = `Bearer ${accessToken}`;
  }
  return config;
});

// 🔁 Handle 401 and auto-refresh token
secureAxios.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      localStorage.getItem('refresh_token')
    ) {
      originalRequest._retry = true;
      try {
        const res = await axios.post(`${baseURL}/api/users/auth/refresh/`, {
          refresh: localStorage.getItem('refresh_token'),
        });
        const newAccessToken = res.data.access;
        localStorage.setItem('access_token', newAccessToken);
        originalRequest.headers['Authorization'] = `Bearer ${newAccessToken}`;
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

// ✅ Login function to store tokens
export const loginAndStoreTokens = async (credentials) => {
  const res = await axios.post(`${baseURL}/api/users/auth/login/`, credentials, {
    withCredentials: true,
    headers: {
      'Content-Type': 'application/json',
    },
  });
  localStorage.setItem('access_token', res.data.access);
  localStorage.setItem('refresh_token', res.data.refresh);
  return res;
};

// ✅ Logout function to clear tokens
export const logoutAndClearTokens = () => {
  localStorage.removeItem('access_token');
  localStorage.removeItem('refresh_token');
};

export default secureAxios;
