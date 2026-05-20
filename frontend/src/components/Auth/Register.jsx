/**
 * REGISTER.JSX - Registration Component
 * Allows new users to create an account
 * 
 * @component Register
 */

import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { FaUser, FaEnvelope, FaLock, FaMusic, FaCheckCircle } from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';

const Register = () => {
  // Form data state
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { register } = useAuth();
  const navigate = useNavigate();
