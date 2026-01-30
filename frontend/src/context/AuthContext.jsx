import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import toast from 'react-hot-toast';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Check if user is authenticated on mount
  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('access_token');
      if (token) {
        try {
          const response = await api.get('/accounts/users/me/');
          setUser(response.data);
        } catch (error) {
          console.error('Auth init error:', error);
          localStorage.removeItem('access_token');
          localStorage.removeItem('refresh_token');
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const login = async (email, password) => {
    try {
      const response = await api.post('/accounts/login/', { email, password });
      const { access, refresh, user: userData } = response.data;
      
      localStorage.setItem('access_token', access);
      localStorage.setItem('refresh_token', refresh);
      setUser(userData);
      
      toast.success(`Welcome back, ${userData.first_name}!`);
      navigate('/dashboard');
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.detail || 'Login failed. Please check your credentials.';
      toast.error(message);
      return { success: false, error: message };
    }
  };

  const logout = useCallback(async () => {
    try {
      const refreshToken = localStorage.getItem('refresh_token');
      if (refreshToken) {
        await api.post('/accounts/logout/', { refresh: refreshToken });
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      setUser(null);
      navigate('/login');
      toast.success('Logged out successfully');
    }
  }, [navigate]);

  const updateProfile = async (data) => {
    try {
      const response = await api.put('/accounts/users/update_profile/', data);
      setUser(prev => ({ ...prev, ...response.data }));
      toast.success('Profile updated successfully');
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.detail || 'Failed to update profile';
      toast.error(message);
      return { success: false, error: message };
    }
  };

  const changePassword = async (oldPassword, newPassword, newPasswordConfirm) => {
    try {
      await api.post('/accounts/users/change_password/', {
        old_password: oldPassword,
        new_password: newPassword,
        new_password_confirm: newPasswordConfirm,
      });
      toast.success('Password changed successfully');
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.detail || 'Failed to change password';
      toast.error(message);
      return { success: false, error: message };
    }
  };

  const value = {
    user,
    loading,
    isAuthenticated: !!user,
    login,
    logout,
    updateProfile,
    changePassword,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthContext;