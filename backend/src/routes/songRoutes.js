const express = require('express');
const router = express.Router();
const { protect, adminMiddleware } = require('../middleware/auth');
const { uploadAudio } = require('../middleware/upload');
const {
    uploadLocalSong,
    getAllSongs,
    getSongById,
    getTrendingSongs,
    getSongsByGenre,
    toggleLikeSong,
    getLikedSongs,
    getMyUploads,
    updateSong,
    deleteSong
} = require('../controllers/songController');

// Public routes
router.get('/', getAllSongs);
router.get('/trending', getTrendingSongs);
router.get('/genre/:genre', getSongsByGenre);
router.get('/:id', getSongById);

// Private routes (require authentication)
router.post('/upload', protect, uploadAudio, uploadLocalSong);
router.post('/:id/like', protect, toggleLikeSong);
router.get('/liked/my-likes', protect, getLikedSongs);
router.get('/uploads/my-uploads', protect, getMyUploads);

// Admin routes
router.put('/:id', protect, adminMiddleware, updateSong);
router.delete('/:id', protect, adminMiddleware, deleteSong);

module.exports = router;