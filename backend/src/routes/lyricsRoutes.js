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

// Private routes
router.post('/:songId', protect, addLyrics);

// Admin routes
router.get('/admin/pending', protect, adminMiddleware, getPendingLyrics);
router.put('/:lyricsId/approve', protect, adminMiddleware, approveLyrics);
router.delete('/:lyricsId', protect, adminMiddleware, deleteLyrics);

module.exports = router;