const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
    searchYouTube,
    getVideoDetails,
    addYouTubeSong,
    getYouTubeStream
} = require('../controllers/youtubeController');

// All routes require authentication
router.get('/search', protect, searchYouTube);
router.get('/video/:videoId', protect, getVideoDetails);
router.post('/add', protect, addYouTubeSong);
router.get('/stream/:videoId', protect, getYouTubeStream);

module.exports = router;