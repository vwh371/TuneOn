/**
 * PRIVATE ROUTE.JSX - Protected Route Component
 * Prevents unauthorized users from accessing protected pages
 * Also handles admin-only route protection
 * 
 * @component PrivateRoute
 */

import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Loader from '../Common/Loader';

const PrivateRoute = ({ children, adminOnly = false }) => {
  const { isAuthenticated, user, loading } = useAuth();

  // Show loader while checking authentication
  if (loading) {
    return <Loader />;
  }
  
  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }
  
  // For admin-only routes, check if user has admin role
  if (adminOnly && user?.role !== 'admin') {
    return <Navigate to="/" />;
  }
  
  // User is authenticated and has required permissions
  return children;
};

export default PrivateRoute;