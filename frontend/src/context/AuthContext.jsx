import { createContext, useState, useEffect } from 'react';
import axiosInstance from '../api/axiosInstance';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const syncUserSession = () => {
      const token = localStorage.getItem('school_platform_token') || sessionStorage.getItem('school_platform_token');
      const savedUser = localStorage.getItem('school_platform_user') || sessionStorage.getItem('school_platform_user');
      if (token && savedUser) {
        setUser(JSON.parse(savedUser));
      }
      setLoading(false);
    };
    syncUserSession();
  }, []);

  const login = async (email, password, rememberMe, allowedRoles) => {
    const res = await axiosInstance.post('/auth/login', { email, password });
    if (!res.data.success || !res.data.user || !res.data.token) {
      throw new Error(res.data.message || 'Unable to sign in. Please check your details and try again.');
    }

    if (allowedRoles && !allowedRoles.includes(res.data.user.role)) {
      throw new Error('This account is not allowed to use this login page.');
    }

    const storage = rememberMe ? localStorage : sessionStorage;
    const otherStorage = rememberMe ? sessionStorage : localStorage;
    storage.setItem('school_platform_token', res.data.token);
    storage.setItem('school_platform_user', JSON.stringify(res.data.user));
    otherStorage.removeItem('school_platform_token');
    otherStorage.removeItem('school_platform_user');
    setUser(res.data.user);
    return res.data.user;
  };

  const logout = () => {
    localStorage.removeItem('school_platform_token');
    localStorage.removeItem('school_platform_user');
    sessionStorage.removeItem('school_platform_token');
    sessionStorage.removeItem('school_platform_user');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
