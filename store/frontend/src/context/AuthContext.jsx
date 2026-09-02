import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const AuthProvider = ({ children }) => {
  const [customer, setCustomer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(localStorage.getItem('customerToken'));

  useEffect(() => {
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      fetchMe();
    } else {
      setLoading(false);
    }
  }, [token]);

  const fetchMe = async () => {
    try {
      const res = await axios.get(`${API_URL}/customer-auth/me`);
      setCustomer(res.data.customer);
    } catch (error) {
      console.error('Error fetching customer profile', error);
      logout();
    } finally {
      setLoading(false);
    }
  };

  const login = (newToken, customerData) => {
    localStorage.setItem('customerToken', newToken);
    setToken(newToken);
    setCustomer(customerData);
  };

  const logout = () => {
    localStorage.removeItem('customerToken');
    setToken(null);
    setCustomer(null);
    delete axios.defaults.headers.common['Authorization'];
  };

  return (
    <AuthContext.Provider value={{ customer, loading, login, logout, token }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
