const express = require('express');
const router = express.Router();
const { protect, adminMiddleware } = require('../middleware/auth');
const {
    registerUser,
    loginUser,
    getMe,
    updateProfile,
    changePassword,
    createAdmin,
    getAllUsers
} = require('../controllers/authController');

// Public routes
router.post('/register', registerUser);
router.post('/login', loginUser);

