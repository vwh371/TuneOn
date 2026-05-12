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
        if (lyrics) {
            // Update existing lyrics (requires admin approval if not admin)
            if (req.user.role !== 'admin' && lyrics.approved) {
                await transaction.rollback();
                return res.status(403).json({
                    success: false,
                    message: 'Approved lyrics can only be edited by admin'
                });
            }
            
            await lyrics.update({
                lyricsText: lyricsText || lyrics.lyricsText,
                syncedLyrics: syncedLyrics || lyrics.syncedLyrics,
                language: language || lyrics.language,
                contributorId: req.user.id,
                approved: req.user.role === 'admin'
            }, { transaction });
        } else {
            // Create new lyrics
            lyrics = await Lyrics.create({
                songId,
                lyricsText,
                syncedLyrics: syncedLyrics || null,
                language: language || 'en',
                contributorId: req.user.id,
                approved: req.user.role === 'admin'
            }, { transaction });
        }
        
        await transaction.commit();
        
        res.status(201).json({
            success: true,
            message: lyrics.approved ? 'Lyrics added successfully' : 'Lyrics submitted for approval',
            lyrics: {
                lyricsText: lyrics.lyricsText,
                syncedLyrics: lyrics.syncedLyrics,
                language: lyrics.language,
                approved: lyrics.approved
            }
        });
    } catch (error) {
        await transaction.rollback();
        console.error(error);
        res.status(500).json({
            success: false,
            message: 'Error adding lyrics',
            error: process.env.NODE_ENV === 'development' ? error.message : {}
        });
    }
};