const { Song, User, Like, Lyrics, PlaylistSong } = require('../models');
const { sequelize } = require('../config/database');
const { Op } = require('sequelize');
const path = require('path');
const fs = require('fs');

// @desc    Upload local song
// @route   POST /api/songs/upload
// @access  Private (Listener/Admin)
const uploadLocalSong = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: 'Please upload an audio file'
            });
        }

        const { title, artist, album, genre, duration } = req.body;

        // Validation
        if (!title || !artist || !duration) {
            // Clean up uploaded file if validation fails
            fs.unlinkSync(req.file.path);
            return res.status(400).json({
                success: false,
                message: 'Please provide title, artist and duration'
            });
        }

        const song = await Song.create({
            title,
            artist,
            album: album || null,
            genre: genre || 'Other',
            duration: parseInt(duration),
            audioUrl: `/uploads/songs/${req.file.filename}`,
            coverImage: req.body.coverImage || '/uploads/images/default-cover.jpg',
            uploadedBy: req.user.id,
            uploadType: 'local'
        });

        res.status(201).json({
            success: true,
            message: 'Song uploaded successfully',
            song
        });
    } catch (error) {
        console.error(error);
        // Clean up uploaded file if error occurs
        if (req.file && req.file.path) {
            fs.unlinkSync(req.file.path);
        }
        res.status(500).json({
            success: false,
            message: 'Error uploading song',
            error: process.env.NODE_ENV === 'development' ? error.message : {}
        });
    }
};

// @desc    Get all songs with search and filters
// @route   GET /api/songs
// @access  Public
const getAllSongs = async (req, res) => {
    try {
        const { page = 1, limit = 20, genre, search, sortBy = 'createdAt', order = 'DESC' } = req.query;
        const offset = (page - 1) * limit;
        
        let whereClause = { isActive: true };
        
        if (genre && genre !== 'all') {
            whereClause.genre = genre;
        }
        
        if (search) {
            whereClause[Op.or] = [
                { title: { [Op.like]: `%${search}%` } },
                { artist: { [Op.like]: `%${search}%` } },
                { album: { [Op.like]: `%${search}%` } }
            ];
        }
        
        const orderDirection = order.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';
        const orderField = ['plays', 'title', 'createdAt', 'duration'].includes(sortBy) ? sortBy : 'createdAt';
        
        const { count, rows: songs } = await Song.findAndCountAll({
            where: whereClause,
            include: [{
                model: User,
                as: 'uploader',
                attributes: ['id', 'name']
            }],
            limit: parseInt(limit),
            offset: parseInt(offset),
            order: [[orderField, orderDirection]],
            distinct: true
        });
        
        // Get like counts for each song
        const songsWithDetails = await Promise.all(songs.map(async (song) => {
            const likesCount = await Like.count({
                where: { songId: song.id, type: 'song' }
            });
            
            const songJson = song.toJSON();
            songJson.likesCount = likesCount;
            
            return songJson;
        }));
        
        res.json({
            success: true,
            songs: songsWithDetails,
            total: count,
            currentPage: parseInt(page),
            totalPages: Math.ceil(count / limit),
            hasNext: parseInt(page) < Math.ceil(count / limit),
            hasPrev: parseInt(page) > 1
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: 'Error fetching songs',
            error: process.env.NODE_ENV === 'development' ? error.message : {}
        });
    }
};

// @desc    Get single song
// @route   GET /api/songs/:id
// @access  Public
const getSongById = async (req, res) => {
    try {
        const song = await Song.findByPk(req.params.id, {
            include: [{
                model: User,
                as: 'uploader',
                attributes: ['id', 'name', 'profilePicture']
            }]
        });
        
        if (!song) {
            return res.status(404).json({
                success: false,
                message: 'Song not found'
            });
        }
        
        if (!song.isActive && (!req.user || req.user.role !== 'admin')) {
            return res.status(404).json({
                success: false,
                message: 'Song not available'
            });
        }
        
        // Increment play count
        song.plays += 1;
        await song.save();
        
        // Get likes count
        const likesCount = await Like.count({
            where: { songId: song.id, type: 'song' }
        });
        
        // Check if current user liked the song
        let userLiked = false;
        if (req.user) {
            const userLike = await Like.findOne({
                where: {
                    userId: req.user.id,
                    songId: song.id,
                    type: 'song'
                }
            });
            userLiked = !!userLike;
        }
        
        // Get lyrics if available
        const lyrics = await Lyrics.findOne({
            where: { songId: song.id, approved: true }
        });
        
        res.json({
            success: true,
            song: song.toJSON(),
            likesCount,
            userLiked,
            lyrics: lyrics ? lyrics.lyricsText : null
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: 'Error fetching song',
            error: process.env.NODE_ENV === 'development' ? error.message : {}
        });
    }
};

// @desc    Get trending songs (most played)
// @route   GET /api/songs/trending
// @access  Public
const getTrendingSongs = async (req, res) => {
    try {
        const { limit = 10 } = req.query;
        
        const songs = await Song.findAll({
            where: { isActive: true },
            order: [['plays', 'DESC']],
            limit: parseInt(limit),
            include: [{
                model: User,
                as: 'uploader',
                attributes: ['id', 'name']
            }]
        });
        
        res.json({
            success: true,
            songs
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: 'Error fetching trending songs'
        });
    }
};

// @desc    Get songs by genre
// @route   GET /api/songs/genre/:genre
// @access  Public
const getSongsByGenre = async (req, res) => {
    try {
        const { genre } = req.params;
        const { limit = 20 } = req.query;
        
        const songs = await Song.findAll({
            where: {
                genre: genre,
                isActive: true
            },
            limit: parseInt(limit),
            order: [['plays', 'DESC']]
        });
        
        res.json({
            success: true,
            songs,
            genre
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: 'Error fetching songs by genre'
        });
    }
};

// @desc    Like/Unlike song
// @route   POST /api/songs/:id/like
// @access  Private
const toggleLikeSong = async (req, res) => {
    const transaction = await sequelize.transaction();
    
    try {
        const song = await Song.findByPk(req.params.id);
        
        if (!song) {
            await transaction.rollback();
            return res.status(404).json({
                success: false,
                message: 'Song not found'
            });
        }
        
        const existingLike = await Like.findOne({
            where: {
                userId: req.user.id,
                songId: song.id,
                type: 'song'
            },
            transaction
        });
        
        if (existingLike) {
            await existingLike.destroy({ transaction });
            await transaction.commit();
            return res.json({
                success: true,
                message: 'Song unliked',
                liked: false
            });
        } else {
            await Like.create({
                userId: req.user.id,
                songId: song.id,
                type: 'song'
            }, { transaction });
            await transaction.commit();
            return res.json({
                success: true,
                message: 'Song liked',
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

// @desc    Get user's liked songs
// @route   GET /api/songs/liked
// @access  Private
const getLikedSongs = async (req, res) => {
    try {
        const likes = await Like.findAll({
            where: {
                userId: req.user.id,
                type: 'song'
            },
            include: [{
                model: Song,
                as: 'song',
                where: { isActive: true },
                required: true
            }],
            order: [['createdAt', 'DESC']]
        });
        
        const songs = likes.map(like => like.song);
        
        res.json({
            success: true,
            songs
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: 'Error fetching liked songs'
        });
    }
};

// @desc    Get user's uploaded songs
// @route   GET /api/songs/my-uploads
// @access  Private
const getMyUploads = async (req, res) => {
    try {
        const songs = await Song.findAll({
            where: {
                uploadedBy: req.user.id,
                isActive: true
            },
            order: [['createdAt', 'DESC']]
        });
        
        res.json({
            success: true,
            songs
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: 'Error fetching your uploads'
        });
    }
};

// @desc    Update song (Admin only)
// @route   PUT /api/songs/:id
// @access  Private/Admin
const updateSong = async (req, res) => {
    try {
        const song = await Song.findByPk(req.params.id);
        
        if (!song) {
            return res.status(404).json({
                success: false,
                message: 'Song not found'
            });
        }
        
        const { title, artist, album, genre, isActive } = req.body;
        
        await song.update({
            title: title || song.title,
            artist: artist || song.artist,
            album: album !== undefined ? album : song.album,
            genre: genre || song.genre,
            isActive: isActive !== undefined ? isActive : song.isActive
        });
        
        res.json({
            success: true,
            message: 'Song updated successfully',
            song
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: 'Error updating song'
        });
    }
};

// @desc    Delete song (Admin only)
// @route   DELETE /api/songs/:id
// @access  Private/Admin
const deleteSong = async (req, res) => {
    const transaction = await sequelize.transaction();
    
    try {
        const song = await Song.findByPk(req.params.id);
        
        if (!song) {
            await transaction.rollback();
            return res.status(404).json({
                success: false,
                message: 'Song not found'
            });
        }
        
        // Delete local file if exists
        if (song.uploadType === 'local' && song.audioUrl) {
            const filePath = path.join(__dirname, '../../', song.audioUrl);
            if (fs.existsSync(filePath)) {
                fs.unlinkSync(filePath);
            }
        }
        
        // Delete related records
        await Like.destroy({
            where: { songId: song.id, type: 'song' },
            transaction
        });
        
        await Lyrics.destroy({
            where: { songId: song.id },
            transaction
        });
        
        await PlaylistSong.destroy({
            where: { songId: song.id },
            transaction
        });
        
        await song.destroy({ transaction });
        await transaction.commit();
        
        res.json({
            success: true,
            message: 'Song deleted successfully'
        });
    } catch (error) {
        await transaction.rollback();
        console.error(error);
        res.status(500).json({
            success: false,
            message: 'Error deleting song'
        });
    }
};

module.exports = {
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
};