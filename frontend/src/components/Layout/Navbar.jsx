// NAVIGATION BAR COMPONENT
// Top navigation bar with logo, search, user menu, and theme toggle

import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaSearch, FaUserCircle, FaMusic, FaMoon, FaSun, FaBars } from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import SearchBar from '../Songs/SearchBar';

const Navbar = () => {
  // Authentication state and functions
  const { user, isAuthenticated, logout } = useAuth();
  // Theme state and toggle function
  const { isDarkMode, toggleTheme } = useTheme();
  const navigate = useNavigate();
  
  // UI State
  const [showDropdown, setShowDropdown] = useState(false);  // User dropdown menu
  const [showMobileMenu, setShowMobileMenu] = useState(false); // Mobile menu

  // Handle user logout
  const handleLogout = () => {
    logout();
    navigate('/');
    setShowDropdown(false);
  };
