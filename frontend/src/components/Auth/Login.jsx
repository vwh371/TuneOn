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
