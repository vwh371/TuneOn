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
// @desc    Get YouTube video details
// @route   GET /api/youtube/video/:videoId
// @access  Private
const getVideoDetails = async (req, res) => {
    try {
        const { videoId } = req.params;
        
        const response = await youtube.videos.list({
            part: 'snippet,contentDetails',
            id: videoId,
            fields: 'items(id,snippet(title,channelTitle,thumbnails(medium)),contentDetails(duration))'
        });
        
        if (!response.data.items.length) {
            return res.status(404).json({
                success: false,
                message: 'Video not found'
            });
        }
        
        const video = response.data.items[0];
        const duration = parseYouTubeDuration(video.contentDetails.duration);
        
        res.json({
            success: true,
            video: {
                videoId: video.id,
                title: video.snippet.title,
                channelName: video.snippet.channelTitle,
                thumbnail: video.snippet.thumbnails.medium.url,
                duration: duration
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: 'Error fetching video details'
        });
    }
};
// @desc    Add YouTube song to platform
// @route   POST /api/youtube/add
// @access  Private (Listener/Admin)
const addYouTubeSong = async (req, res) => {
    try {
        const { videoId, title, artist, thumbnail, genre } = req.body;
        
        if (!videoId) {
            return res.status(400).json({
                success: false,
                message: 'Video ID is required'
            });
        }
        
        // Check if song already exists
        const existingSong = await Song.findOne({
            where: { youtubeVideoId: videoId }
        });
        
        if (existingSong) {
            return res.status(400).json({
                success: false,
                message: 'This song already exists in the platform',
                song: existingSong
            });
        }
        
        // Get video details
        const videoResponse = await youtube.videos.list({
            part: 'contentDetails,snippet',
            id: videoId
        });
        
        if (!videoResponse.data.items.length) {
            return res.status(404).json({
                success: false,
                message: 'Video not found on YouTube'
            });
        }
        
        const videoDetails = videoResponse.data.items[0];
        const duration = parseYouTubeDuration(videoDetails.contentDetails.duration);
        
        const song = await Song.create({
            title: title || videoDetails.snippet.title,
            artist: artist || videoDetails.snippet.channelTitle,
            genre: genre || 'Other',
            duration: duration,
            audioUrl: `https://www.youtube.com/watch?v=${videoId}`,
            coverImage: thumbnail || videoDetails.snippet.thumbnails.medium.url,
            uploadedBy: req.user.id,
            uploadType: 'youtube',
            youtubeVideoId: videoId
        });
        
        res.status(201).json({
            success: true,
            message: 'YouTube song added successfully',
            song
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: 'Error adding YouTube song',
            error: process.env.NODE_ENV === 'development' ? error.message : {}
        });
    }
};
// @desc    Get YouTube stream info
// @route   GET /api/youtube/stream/:videoId
// @access  Private
const getYouTubeStream = async (req, res) => {
    try {
        const { videoId } = req.params;
        
        // Return embed URL for frontend integration
        res.json({
            success: true,
            streamUrl: `https://www.youtube.com/watch?v=${videoId}`,
            embedUrl: `https://www.youtube.com/embed/${videoId}`,
            thumbnailUrl: `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: 'Error getting stream URL'
        });
    }
};

module.exports = {
    searchYouTube,
    getVideoDetails,
    addYouTubeSong,
    getYouTubeStream
};