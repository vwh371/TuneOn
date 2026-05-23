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

        {/* Login Form */}
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            
            {/* Email Input Field */}
            <div className="relative">
              <FaEnvelope className="absolute left-3 top-3 text-gray-400" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:ring-green-500 focus:border-green-500"
                placeholder="Email address"
              />
            </div>
            
            {/* Password Input Field */}
            <div className="relative">
              <FaLock className="absolute left-3 top-3 text-gray-400" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:ring-green-500 focus:border-green-500"
                placeholder="Password"
              />
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin h-5 w-5 mr-2" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Signing in...
              </span>
            ) : (
              'Sign in'
            )}
          </button>
        </form>

        {/* Demo Credentials for Testing */}
        <div className="p-4 bg-gray-800 rounded-lg text-center">
          <p className="text-xs text-gray-400 mb-2">Demo Accounts:</p>
          <p className="text-xs text-gray-400">Listener: listener@example.com / password123</p>
          <p className="text-xs text-gray-400">Admin: admin@musicstreaming.com / Admin@123456</p>
        </div>
      </div>
    </div>
  );
};

export default Login;