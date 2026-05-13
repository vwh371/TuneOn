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

// Private routes
router.post('/', protect, createPlaylist);
router.get('/my-playlists/my', protect, getUserPlaylists);
router.post('/:id/add-song', protect, addSongToPlaylist);
router.delete('/:id/remove-song', protect, removeSongFromPlaylist);
router.put('/:id', protect, updatePlaylist);
router.delete('/:id', protect, deletePlaylist);
router.post('/:id/like', protect, toggleLikePlaylist);

module.exports = router;