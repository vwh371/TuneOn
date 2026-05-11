const { youtube, parseYouTubeDuration } = require('../config/youtube');
const { Song } = require('../models');

// @desc    Search YouTube songs
// @route   GET /api/youtube/search
// @access  Private
const searchYouTube = async (req, res) => {
    try {
        const { q, maxResults = 10 } = req.query;
        
        if (!q) {
            return res.status(400).json({
                success: false,
                message: 'Search query is required'
            });
        }
        
        const response = await youtube.search.list({
            part: 'snippet',
            q: `${q} song audio`,
            maxResults: parseInt(maxResults),
            type: 'video',
            videoCategoryId: '10', // Music category
            fields: 'items(id(videoId),snippet(title,channelTitle,thumbnails(medium)))'
        });
        
        const videos = response.data.items.map(item => ({
            videoId: item.id.videoId,
            title: item.snippet.title,
            channelName: item.snippet.channelTitle,
            thumbnail: item.snippet.thumbnails.medium.url
        }));
        
        res.json({
            success: true,
            count: videos.length,
            videos
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: 'Error searching YouTube',
            error: process.env.NODE_ENV === 'development' ? error.message : 'YouTube API error'
        });
    }
};