/**
 * AUTH CONTEXT - Authentication State Management
 * Provides authentication state and methods throughout the app
 * 
 * @context AuthContext
 */

import React, { createContext, useState, useContext, useEffect } from 'react';
import authService from '../services/authService';
import { toast } from 'react-toastify';

// Create context object
const AuthContext = createContext();

// Custom hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
