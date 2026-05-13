const express = require('express');
const router = express.Router();
const { protect, adminMiddleware } = require('../middleware/auth');
const {
    createPlaylist,
    getUserPlaylists,
    getPublicPlaylists,
    getPlaylistById,
    addSongToPlaylist,
    removeSongFromPlaylist,
    updatePlaylist,
    deletePlaylist,
    toggleLikePlaylist
} = require('../controllers/playlistController');

// Public routes
router.get('/public', getPublicPlaylists);
router.get('/:id', getPlaylistById);

