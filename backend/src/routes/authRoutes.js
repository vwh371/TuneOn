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

// Private routes
router.get('/me', protect, getMe);
router.put('/profile', protect, updateProfile);
router.put('/change-password', protect, changePassword);

// Admin routes
router.post('/create-admin', protect, adminMiddleware, createAdmin);
router.get('/users', protect, adminMiddleware, getAllUsers);

module.exports = router;