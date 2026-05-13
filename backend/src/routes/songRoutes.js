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

