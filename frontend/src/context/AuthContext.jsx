/**
 * Authentication Context Provider
 * Manages user authentication state, login, register, and logout
 */
import React, { createContext, useState, useContext, useEffect } from 'react';
import authService from '../services/authService';
import { toast } from 'react-toastify';

// Create Context object
const AuthContext = createContext();

// Custom hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  // State management
  const [user, setUser] = useState(null);           // Current user object
  const [isAuthenticated, setIsAuthenticated] = useState(false); // Authentication status
  const [loading, setLoading] = useState(true);     // Loading state for initial auth check
  const [token, setToken] = useState(null);         // JWT token

  // Check for existing session on mount
  useEffect(() => {
    const initializeAuth = async () => {
      const storedToken = localStorage.getItem('token');
      const storedUser = authService.getCurrentUser();
      
      if (storedToken && storedUser) {
        setToken(storedToken);
        setUser(storedUser);
        setIsAuthenticated(true);
      }
      setLoading(false);
    };

    initializeAuth();
  }, []);

  /**
   * Register a new user
   * @param {Object} userData - User registration data (name, email, password)
   */
  const register = async (userData) => {
    try {
      const response = await authService.register(userData);
      setUser(response.user);
      setIsAuthenticated(true);
      setToken(response.token);
      toast.success('Registration successful! Welcome aboard!');
      return response;
    } catch (error) {
      const message = error.response?.data?.message || 'Registration failed';
      toast.error(message);
      throw error;
    }
  };

  /**
   * Login user
   * @param {Object} credentials - User credentials (email, password)
   */
  const login = async (credentials) => {
    try {
      const response = await authService.login(credentials);
      setUser(response.user);
      setIsAuthenticated(true);
      setToken(response.token);
      toast.success(`Welcome back, ${response.user.name}!`);
      return response;
    } catch (error) {
      const message = error.response?.data?.message || 'Login failed';
      toast.error(message);
      throw error;
    }
  };

  /**
   * Logout user - Clear all auth data
   */
  const logout = () => {
    authService.logout();
    setUser(null);
    setIsAuthenticated(false);
    setToken(null);
    toast.info('You have been logged out');
  };

  /**
   * Update user profile information
   * @param {Object} userData - Updated profile data
   */
  const updateProfile = async (userData) => {
    try {
      const response = await authService.updateProfile(userData);
      setUser(response.user);
      toast.success('Profile updated successfully');
      return response;
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update profile');
      throw error;
    }
  };

  /**
   * Change user password
   * @param {Object} passwordData - Current and new password
   */
  const changePassword = async (passwordData) => {
    try {
      const response = await authService.changePassword(passwordData);
      toast.success('Password changed successfully');
      return response;
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to change password');
      throw error;
    }
  };

