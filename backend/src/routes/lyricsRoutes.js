const express = require('express');
const router = express.Router();
const { protect, adminMiddleware } = require('../middleware/auth');
const {
    addLyrics,
    getLyrics,
    getPendingLyrics,
    approveLyrics,
    deleteLyrics,
    searchLyrics
} = require('../controllers/lyricsController');

// Public routes
router.get('/search', searchLyrics);
router.get('/:songId', getLyrics);

