const { Lyrics, Song, User } = require('../models');
const { sequelize } = require('../config/database');

// @desc    Add lyrics to song
// @route   POST /api/lyrics/:songId
// @access  Private (Admin only for approval, anyone can contribute)
const addLyrics = async (req, res) => {
    const transaction = await sequelize.transaction();
    
    try {
        const { lyricsText, syncedLyrics, language } = req.body;
        const songId = req.params.songId;
        
        if (!lyricsText) {
            await transaction.rollback();
            return res.status(400).json({
                success: false,
                message: 'Lyrics text is required'
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
        
        let lyrics = await Lyrics.findOne({ where: { songId }, transaction });