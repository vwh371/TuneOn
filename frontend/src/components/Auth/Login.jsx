/**
 * LOGIN.JSX - Login Component
 * Allows users to authenticate with email and password
 * 
 * @component Login
 */

import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { FaEnvelope, FaLock, FaMusic } from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';

const Login = () => {
  // State variables for form data
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  
  // Get login function from auth context
  const { login } = useAuth();
  const navigate = useNavigate();

  // Handle form submission
  const handleSubmit = async (event) => {
    event.preventDefault();  // Prevent page refresh
    setLoading(true);        // Show loading state
    
    try {
      await login({ email, password });
      navigate('/');         // Redirect to home on success
    } catch (error) {
      // Error is handled in AuthContext
      console.error('Login error:', error);
    } finally {
      setLoading(false);     // Hide loading state
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 to-black py-12 px-4">
      <div className="max-w-md w-full space-y-8 bg-surface rounded-2xl p-8">
        
        {/* Header Section - Logo and Welcome Message */}
        <div className="text-center">
          <div className="flex justify-center">
            <FaMusic className="text-green-500 text-6xl" />
          </div>
          <h2 className="mt-6 text-3xl font-bold text-white">Welcome Back</h2>
          <p className="mt-2 text-gray-400">
            Don't have an account?{' '}
            <Link to="/register" className="text-green-500 hover:text-green-400 font-medium">
              Sign up
            </Link>
          </p>
        </div>
