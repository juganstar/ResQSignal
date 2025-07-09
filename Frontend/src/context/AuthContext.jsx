import { createContext, useContext, useEffect, useState } from 'react';
import axios from '../utils/axiosDefaults';
import { jwtDecode } from 'jwt-decode';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('access');
    if (token) {
      try {
        const decoded = jwtDecode(token);
        setUser({
          pk: decoded.user_id,
          username: decoded.username,
          email: decoded.email,
        });
        setIsAuthenticated(true);
      } catch (err) {
        console.error('Invalid access token');
      }
    }
    setLoading(false);
  }, []);

  const login = async (username, password) => {
    try {
      const res = await axios.post('/api/users/auth/login/', {
        username: username.toLowerCase(),
        password,
      });
      localStorage.setItem('access', res.data.access);
      localStorage.setItem('refresh', res.data.refresh);

      const decoded = jwtDecode(res.data.access);
      setUser({
        pk: decoded.user_id,
        username: decoded.username,
        email: decoded.email,
      });
      setIsAuthenticated(true);
    } catch (err) {
      throw err;
    }
  };

  const logout = () => {
    localStorage.removeItem('access');
    localStorage.removeItem('refresh');
    setIsAuthenticated(false);
    setUser(null);
    window.location.href = '/login';
  };

  return loading ? null : (
    <AuthContext.Provider value={{ isAuthenticated, user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
