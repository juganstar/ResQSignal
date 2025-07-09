import { createContext, useContext, useEffect, useState } from 'react';
import axios from '../utils/axiosDefaults'; // uses secureAxios with baseURL + JWT
import jwtDecode from 'jwt-decode';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    initializeAuth();
  }, []);

  const initializeAuth = () => {
    const access = localStorage.getItem('access');
    const refresh = localStorage.getItem('refresh');

    if (access && refresh) {
      try {
        const decoded = jwtDecode(access);
        setUser({
          username: decoded.username,
          email: decoded.email,
          pk: decoded.user_id,
        });
        setIsAuthenticated(true);
      } catch (err) {
        clearAuth();
      }
    }
    setLoading(false);
  };

  const login = async (username, password) => {
    try {
      const res = await axios.post('/api/users/auth/login/', {
        username: username.toLowerCase(),
        password,
      });

      const { access, refresh } = res.data;
      localStorage.setItem('access', access);
      localStorage.setItem('refresh', refresh);

      const decoded = jwtDecode(access);
      setUser({
        username: decoded.username,
        email: decoded.email,
        pk: decoded.user_id,
      });
      setIsAuthenticated(true);
      return true;
    } catch (err) {
      clearAuth();
      throw err;
    }
  };

  const logout = () => {
    clearAuth();
    window.location.pathname = '/login';
  };

  const clearAuth = () => {
    localStorage.removeItem('access');
    localStorage.removeItem('refresh');
    setUser(null);
    setIsAuthenticated(false);
  };

  return loading ? (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
    </div>
  ) : (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        user,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
