import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext();

export const DEMO_ACCOUNTS = {
  citizen: {
    email: 'citizen@civiceye.gov',
    password: 'Citizen123!',
    label: 'Citizen (Demo Citizen)',
    role: 'citizen',
  },
  dept_head: {
    email: 'roads.head@civiceye.gov',
    password: 'DeptHead123!',
    label: 'Dept Head (Roads & Infra)',
    role: 'dept_head',
  },
  verifier: {
    email: 'verifier.roads@civiceye.gov',
    password: 'Verifier123!',
    label: 'Field Verifier (Roads)',
    role: 'verifier',
  },
  admin: {
    email: 'admin@civiceye.gov',
    password: 'Admin123!',
    label: 'Super Admin (Commissioner)',
    role: 'admin',
  },
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('civiceye_token') || null);
  const [loading, setLoading] = useState(true);

  // Load user profile on initial mount
  useEffect(() => {
    const fetchUser = async () => {
      if (!token) {
        setLoading(false);
        return;
      }
      try {
        const res = await api.get('/auth/me');
        if (res.data.success) {
          setUser(res.data.user);
        }
      } catch (err) {
        console.error('Failed to authenticate stored token:', err);
        localStorage.removeItem('civiceye_token');
        setToken(null);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [token]);

  // Login handler
  const login = async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    if (res.data.success) {
      localStorage.setItem('civiceye_token', res.data.token);
      setToken(res.data.token);
      setUser(res.data.user);
      return res.data.user;
    }
  };

  // Register handler
  const register = async (userData) => {
    const res = await api.post('/auth/register', userData);
    if (res.data.success) {
      localStorage.setItem('civiceye_token', res.data.token);
      setToken(res.data.token);
      setUser(res.data.user);
      return res.data.user;
    }
  };

  // Quick switch role for testing
  const switchRole = async (roleKey) => {
    const demo = DEMO_ACCOUNTS[roleKey];
    if (demo) {
      return await login(demo.email, demo.password);
    }
  };

  // Logout handler
  const logout = () => {
    localStorage.removeItem('civiceye_token');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login,
        register,
        logout,
        switchRole,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
