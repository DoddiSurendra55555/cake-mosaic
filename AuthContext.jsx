import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import authService from '../services/authService.js';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(authService.getCurrentUser());
  const [token, setToken] = useState(authService.getAuthToken());
  const navigate = useNavigate();

  const handleLogin = async (email, password) => {
    try {
      const data = await authService.login(email, password);
      setUser(data.user); // data.user now contains { id, email, role, shop_id, shop_name }
      setToken(data.token);
      
      if (data.user.role === 'shopkeeper') {
        navigate('/admin');
      } else {
        navigate('/');
      }
    } catch (error) {
      console.error('Login failed:', error);
    }
  };

  const handleRegister = async (email, password, role, shopName) => {
    try {
      await authService.register(email, password, role, shopName);
      await handleLogin(email, password);
    } catch (error) {
      console.error('Registration failed:', error);
    }
  };

  const handleLogout = () => {
    authService.logout();
    setUser(null);
    setToken(null);
    navigate('/');
  };
  
  // --- NEW: Function to update user state ---
  const updateShopName = (newShopName) => {
    if (user) {
      const updatedUser = { ...user, shop_name: newShopName };
      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
    }
  };

  const value = {
    user,
    token,
    onLogin: handleLogin,
    onRegister: handleRegister,
    onLogout: handleLogout,
    updateShopName // --- NEW ---
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};