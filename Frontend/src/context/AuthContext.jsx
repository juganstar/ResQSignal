import { createContext, useContext, useEffect, useState } from 'react';
import axios, { fetchCSRFToken } from '../api/axios'; // ✅ Use your secureAxios setup

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    initializeAuth();
  }, []);

  const initializeAuth = async () => {
    try {
      await fetchCSRFToken(); // ✅ Get token before anything
      const success = await checkAuthStatus();
      if (!success) clearAuth();
    } catch (err) {
      clearAuth();
    } finally {
      setLoading(false);
    }
  };

  const checkAuthStatus = async () => {
    try {
      const response = await axios.get('/api/users/me/');
      if (response.data && response.data.pk) {
        setAuth(response.data);
        return true;
      }
      return false;
    } catch (error) {
      console.warn('❌ /api/users/me/ failed:', error.response?.status);
      return false;
    }
  };

  const login = async (username, password) => {
    try {
      await fetchCSRFToken();
      await axios.post('/api/users/auth/login/', {
        username: username.toLowerCase(),
        password,
      });
      const success = await checkAuthStatus();
      if (!success) throw new Error('Session verification failed');
      return true;
    } catch (error) {
      console.error('🔐 Login error:', error);
      clearAuth();
      throw error;
    }
  };

  const logout = async () => {
    try {
      const csrfToken = getCSRFToken(); // 👈 manually read cookie
      await axios.post(
        '/api/users/auth/logout/',
        null,
        {
          headers: {
            'X-CSRFToken': csrfToken,
          },
        }
      );
    } catch (error) {
      console.error('🚪 Logout error:', error);
    } finally {
      clearAuth();
      window.location.pathname = '/login';
    }
  };

  const setAuth = (userData) => {
    setUser(userData);
    setIsAuthenticated(true);
    localStorage.setItem(
      'livesignal_user',
      JSON.stringify({
        username: userData.username,
        email: userData.email,
        pk: userData.pk,
      })
    );
  };

  const clearAuth = () => {
    setUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem('livesignal_user');
  };

  const getCSRFToken = () => {
    return (
      document.cookie
        .split('; ')
        .find(row => row.startsWith('csrftoken='))?.split('=')[1] || ''
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        user,
        login,
        logout,
        checkAuthStatus,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
