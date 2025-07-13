import { createContext, useContext, useEffect, useState } from 'react';
import axios from '../utils/axiosDefaults';
import { jwtDecode } from 'jwt-decode';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    initializeAuth();
  }, []);

  const initializeAuth = async () => {
    const token = localStorage.getItem('access');
    if (!token) {
      clearAuth();
      setLoading(false);
      return;
    }

    try {
      const decoded = jwtDecode(token);
      // Optionally check expiration here if needed
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;

      const res = await axios.get("/api/users/me/");
      setUser(res.data);  // Full user from backend
      setIsAuthenticated(true);
    } catch (err) {
      console.error("Auth init failed:", err);
      clearAuth();
    } finally {
      setLoading(false);
    }
  };


  const login = async (username, password) => {
    const safeUsername = typeof username === "string" ? username.trim().toLowerCase() : "";
    const response = await axios.post("/api/users/auth/login/", {
      username: safeUsername,
      password,
    });

    const { access, refresh } = res.data;
    localStorage.setItem('access', access);
    localStorage.setItem('refresh', refresh);
    axios.defaults.headers.common['Authorization'] = `Bearer ${access}`;

    const userRes = await axios.get("/api/users/me/");
    setUser(userRes.data);
    setIsAuthenticated(true);
  };


  const logout = () => {
    clearAuth();
    window.location.href = '/login';
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
    <AuthContext.Provider value={{ isAuthenticated, user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
