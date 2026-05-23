const { Playlist, Song, User, PlaylistSong, Like, sequelize } = require('../models');
const { Op } = require('sequelize');

// @desc    Create playlist
// @route   POST /api/playlists
// @access  Private
const createPlaylist = async (req, res) => {
    try {
        const { name, description, isPublic, coverImage } = req.body;
        
        if (!name) {
            return res.status(400).json({
                success: false,
                message: 'Playlist name is required'
            });
        }
        
        const playlist = await Playlist.create({
            name,
            description: description || null,
            coverImage: coverImage || '/uploads/images/default-playlist.jpg',
            ownerId: req.user.id,
            isPublic: isPublic !== undefined ? isPublic : true
        });
        
        res.status(201).json({
            success: true,
            message: 'Playlist created successfully',
            playlist
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: 'Error creating playlist',
            error: process.env.NODE_ENV === 'development' ? error.message : {}
        });
    }
};

// @desc    Get user playlists
// @route   GET /api/playlists/my-playlists
// @access  Private
const getUserPlaylists = async (req, res) => {
    try {
        const playlists = await Playlist.findAll({
            where: { ownerId: req.user.id },
            include: [{
                model: Song,
                as: 'songs',
                attributes: ['id', 'title', 'artist', 'duration', 'coverImage'],
                through: { attributes: ['addedAt'] }
            }],
            order: [['createdAt', 'DESC']]
        });
        
        // Get like counts
        const playlistsWithDetails = await Promise.all(playlists.map(async (playlist) => {
            const likesCount = await Like.count({
                where: { playlistId: playlist.id, type: 'playlist' }
            });
            
            return {
                ...playlist.toJSON(),
                likesCount,
                songCount: playlist.songs.length
            };
        }));
        
        res.json({
            success: true,
            playlists: playlistsWithDetails
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: 'Error fetching playlists'
        });
    }
};

// @desc    Get public playlists
// @route   GET /api/playlists/public
// @access  Public
const getPublicPlaylists = async (req, res) => {
    try {
        const { page = 1, limit = 20, search } = req.query;
        const offset = (page - 1) * limit;
        
        let whereClause = { isPublic: true };
        
        if (search) {
            whereClause.name = { [Op.like]: `%${search}%` };
        }
        
        const { count, rows: playlists } = await Playlist.findAndCountAll({
            where: whereClause,
            include: [
                {
                    model: User,
                    as: 'owner',
                    attributes: ['id', 'name', 'profilePicture']
                },
                {
                    model: Song,
                    as: 'songs',
                    attributes: ['id', 'title', 'artist', 'duration', 'coverImage'],
                    through: { attributes: [] },
                    limit: 5
                }
            ],
            limit: parseInt(limit),
            offset: parseInt(offset),
            order: [['createdAt', 'DESC']],
            distinct: true
        });
        
        // Get likes count for each playlist
        const playlistsWithDetails = await Promise.all(playlists.map(async (playlist) => {
            const likesCount = await Like.count({
                where: { playlistId: playlist.id, type: 'playlist' }
            });
            
            return {
                ...playlist.toJSON(),
                likesCount,
                songCount: playlist.songs.length
            };
        }));
        
        res.json({
            success: true,
            playlists: playlistsWithDetails,
            total: count,
            currentPage: parseInt(page),
            totalPages: Math.ceil(count / limit)
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: 'Error fetching public playlists'
        });
    }
};

// @desc    Get single playlist
// @route   GET /api/playlists/:id
// @access  Public
const getPlaylistById = async (req, res) => {
    try {
        const playlist = await Playlist.findByPk(req.params.id, {
            include: [
                {
                    model: User,
                    as: 'owner',
                    attributes: ['id', 'name', 'profilePicture']
                },
                {
                    model: Song,
                    as: 'songs',
                    attributes: ['id', 'title', 'artist', 'duration', 'coverImage', 'plays'],
                    through: { attributes: ['addedAt'] }
                }
            ]
        });
        
        if (!playlist) {
            return res.status(404).json({
                success: false,
                message: 'Playlist not found'
            });
        }
        
        // Check if private and user is not owner
        if (!playlist.isPublic && (!req.user || playlist.ownerId !== req.user.id)) {
            return res.status(403).json({
                success: false,
                message: 'This playlist is private'
            });
        }
        
        // Get likes count
        const likesCount = await Like.count({
            where: { playlistId: playlist.id, type: 'playlist' }
        });
        
        // Check if user liked
        let userLiked = false;
        if (req.user) {
            const userLike = await Like.findOne({
                where: {
                    userId: req.user.id,
                    playlistId: playlist.id,
                    type: 'playlist'
                }
            });
            userLiked = !!userLike;
        }
        
        res.json({
            success: true,
            playlist: playlist.toJSON(),
            likesCount,
            userLiked,
            songCount: playlist.songs.length
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: 'Error fetching playlist'
        });
    }
};

// @desc    Add song to playlist
// @route   POST /api/playlists/:id/add-song
// @access  Private
const addSongToPlaylist = async (req, res) => {
    const transaction = await sequelize.transaction();
    
    try {
        const { songId } = req.body;
        
        if (!songId) {
            await transaction.rollback();
            return res.status(400).json({
                success: false,
                message: 'Song ID is required'
            });
        }
        
        const playlist = await Playlist.findByPk(req.params.id);
        
        if (!playlist) {
            await transaction.rollback();
            return res.status(404).json({
                success: false,
                message: 'Playlist not found'
            });
        }
        
        // Check ownership
        if (playlist.ownerId !== req.user.id) {
            await transaction.rollback();
            return res.status(403).json({
                success: false,
                message: 'Not authorized to modify this playlist'
            });
        }
        
        const song = await Song.findByPk(songId);
        if (!song) {
            await transaction.rollback();
            return res.status(404).json({
                success: false,
                message: 'Song not found'
            });
        }
        
        // Check if song already in playlist
        const existingEntry = await PlaylistSong.findOne({
            where: {
                playlistId: playlist.id,
                songId: songId
            },
            transaction
        });
        
        if (existingEntry) {
            await transaction.rollback();
            return res.status(400).json({
                success: false,
                message: 'Song already in playlist'
            });
        }
        
        await PlaylistSong.create({
            playlistId: playlist.id,
            songId: songId
        }, { transaction });
        
        await transaction.commit();
        
        res.json({
            success: true,
            message: 'Song added to playlist successfully'
        });
    } catch (error) {
        await transaction.rollback();
        console.error(error);
        res.status(500).json({
            success: false,
            message: 'Error adding song to playlist'
        });
    }
};

// @desc    Remove song from playlist
// @route   DELETE /api/playlists/:id/remove-song
// @access  Private
const removeSongFromPlaylist = async (req, res) => {
    const transaction = await sequelize.transaction();
    
    try {
        const { songId } = req.body;
        
        if (!songId) {
            await transaction.rollback();
            return res.status(400).json({
                success: false,
                message: 'Song ID is required'
            });
        }
        
        const playlist = await Playlist.findByPk(req.params.id);
        
        if (!playlist) {
            await transaction.rollback();
            return res.status(404).json({
                success: false,
                message: 'Playlist not found'
            });
        }
        
        // Check ownership
        if (playlist.ownerId !== req.user.id) {
            await transaction.rollback();
            return res.status(403).json({
                success: false,
                message: 'Not authorized to modify this playlist'
            });
        }
        
        const deleted = await PlaylistSong.destroy({
            where: {
                playlistId: playlist.id,
                songId: songId
            },
            transaction
        });
        
        if (deleted === 0) {
            await transaction.rollback();
            return res.status(404).json({
                success: false,
                message: 'Song not found in playlist'
            });
        }
        
        await transaction.commit();
        
        res.json({
            success: true,
            message: 'Song removed from playlist successfully'
        });
    } catch (error) {
        await transaction.rollback();
        console.error(error);
        res.status(500).json({
            success: false,
            message: 'Error removing song from playlist'
        });
    }
};

// @desc    Update playlist
// @route   PUT /api/playlists/:id
// @access  Private
const updatePlaylist = async (req, res) => {
    try {
        const playlist = await Playlist.findByPk(req.params.id);
        
        if (!playlist) {
            return res.status(404).json({
                success: false,
                message: 'Playlist not found'
            });
        }
        
        // Check ownership
        if (playlist.ownerId !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to update this playlist'
            });
        }
        
        const { name, description, isPublic, coverImage } = req.body;
        
        await playlist.update({
            name: name || playlist.name,
            description: description !== undefined ? description : playlist.description,
            isPublic: isPublic !== undefined ? isPublic : playlist.isPublic,
            coverImage: coverImage || playlist.coverImage
        });
        
        res.json({
            success: true,
            message: 'Playlist updated successfully',
            playlist
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: 'Error updating playlist'
        });
    }
};

// @desc    Delete playlist
// @route   DELETE /api/playlists/:id
// @access  Private
const deletePlaylist = async (req, res) => {
    const transaction = await sequelize.transaction();
    
    try {
        const playlist = await Playlist.findByPk(req.params.id);
        
        if (!playlist) {
            await transaction.rollback();
            return res.status(404).json({
                success: false,
                message: 'Playlist not found'
            });
        }
        
        // Check ownership
        if (playlist.ownerId !== req.user.id && req.user.role !== 'admin') {
            await transaction.rollback();
            return res.status(403).json({
                success: false,
                message: 'Not authorized to delete this playlist'
            });
        }
        
        // Delete related records
        await PlaylistSong.destroy({
            where: { playlistId: playlist.id },
            transaction
        });
        
        await Like.destroy({
            where: { playlistId: playlist.id, type: 'playlist' },
            transaction
        });
        
        await playlist.destroy({ transaction });
        await transaction.commit();
        
        res.json({
            success: true,
            message: 'Playlist deleted successfully'
        });
    } catch (error) {
        await transaction.rollback();
        console.error(error);
        res.status(500).json({
            success: false,
            message: 'Error deleting playlist'
        });
    }
};

// @desc    Like/Unlike playlist
// @route   POST /api/playlists/:id/like
// @access  Private
const toggleLikePlaylist = async (req, res) => {
    const transaction = await sequelize.transaction();
    
    try {
        const playlist = await Playlist.findByPk(req.params.id);
        
        if (!playlist) {
            await transaction.rollback();
            return res.status(404).json({
                success: false,
                message: 'Playlist not found'
            });
        }
        
        const existingLike = await Like.findOne({
            where: {
                userId: req.user.id,
                playlistId: playlist.id,
                type: 'playlist'
            },
            transaction
        });
        
        if (existingLike) {
            await existingLike.destroy({ transaction });
            await transaction.commit();
            return res.json({
                success: true,
                message: 'Playlist unliked',
                liked: false
            });
        } else {
            await Like.create({
                userId: req.user.id,
                playlistId: playlist.id,
                type: 'playlist'
            }, { transaction });
            await transaction.commit();
            return res.json({
                success: true,
                message: 'Playlist liked',
                liked: true
            });
        }
    } catch (error) {
        await transaction.rollback();
        console.error(error);
        res.status(500).json({
            success: false,
            message: 'Error toggling like'
        });
    }
};

module.exports = {
    createPlaylist,
    getUserPlaylists,
    getPublicPlaylists,
    getPlaylistById,
    addSongToPlaylist,
    removeSongFromPlaylist,
    updatePlaylist,
    deletePlaylist,
    toggleLikePlaylist
};