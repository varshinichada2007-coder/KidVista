import React, { createContext, useState, useEffect } from 'react';
import API from '../services/api';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const checkSession = async () => {
    const token = localStorage.getItem('token');

    if (!token) {
      setUser(null);
      setLoading(false);
      return;
    }

    try {
      const response = await API.get('/auth/me');
      setUser(response.data.user);
    } catch (error) {
      localStorage.removeItem('token');
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkSession();
  }, []);

  const login = async (email, password, adminSecret = '') => {
    try {
      const response = await API.post('/auth/login', {
        email,
        password,
        adminSecret
      });

      const { token, user: loggedUser } = response.data;

      localStorage.setItem('token', token);
      setUser(loggedUser);

      return loggedUser;
    } catch (error) {
      throw error.response?.data?.message || 'Login failed. Please check credentials.';
    }
  };

  const signup = async (name, email, password, role, childName = '', childAge = '', requestedClassroom = '') => {
    try {
      const response = await API.post('/auth/signup', {
        name,
        email,
        password,
        role,
        childName,
        childAge,
        requestedClassroom
      });

      return response.data.message;
    } catch (error) {
      throw error.response?.data?.message || 'Signup failed.';
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, signup, logout, checkSession }}>
      {children}
    </AuthContext.Provider>
  );
};