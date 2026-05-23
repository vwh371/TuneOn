/**
 * Song Card Component
 * Displays a song in a card format with play, like, and navigation functionality
 */
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaPlay, FaPause, FaHeart, FaHeartBroken } from 'react-icons/fa';
import { usePlayer } from '../../context/PlayerContext';
import { useAuth } from '../../context/AuthContext';
import songService from '../../services/songService';
import { formatDuration } from '../../utils/helpers';

const SongCard = ({ song, isLiked = false, onLikeToggle, variant = 'default' }) => {
  // Hooks
  const navigate = useNavigate();
  const { currentSong, isPlaying, playSong, pause } = usePlayer();
  const { isAuthenticated } = useAuth();
  
  // Local state
  const [liked, setLiked] = useState(isLiked);
  const [hovered, setHovered] = useState(false);
  const [loading, setLoading] = useState(false);

  // Check if this song is currently playing
  const isCurrentSong = currentSong?.id === song.id;

  /**
   * Handle play/pause button click
   * @param {Event} e - Click event
   */
  const handlePlayPause = async (e) => {
    e.stopPropagation();
    
    if (isCurrentSong && isPlaying) {
      pause();
    } else {
      // If song is from YouTube, we need special handling
      if (song.uploadType === 'youtube') {
        // For YouTube songs, we might want to use YouTube player
        playSong(song);
      } else {
        playSong(song);
      }
    }
  };

  /**
   * Handle like/unlike button click
   * @param {Event} e - Click event
   */
  const handleLike = async (e) => {
    e.stopPropagation();
    
    // Redirect to login if not authenticated
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    
    setLoading(true);
    try {
      await songService.likeSong(song.id);
      const newLikedState = !liked;
      setLiked(newLikedState);
      
      // Notify parent component if callback provided
      if (onLikeToggle) {
        onLikeToggle(song.id, newLikedState);
      }
    } catch (error) {
      console.error('Error toggling like:', error);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Navigate to song detail page
   */
  const handleCardClick = () => {
    navigate(`/song/${song.id}`);
  };

  // Different variants for different display contexts
  const variants = {
    default: 'w-full',           // Normal grid view
    compact: 'w-48',             // Smaller card for playlists
    list: 'flex items-center p-3' // List view style
  };

  return (
    <div
      className={`${variants[variant]} card group relative`}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={handleCardClick}
    >
      {variant === 'list' ? (
        // List view layout
        <div className="flex items-center space-x-4 w-full">
          <div className="relative">
            <img
              src={song.coverImage || '/assets/default-cover.jpg'}
              alt={song.title}
              className="w-12 h-12 rounded object-cover"
              loading="lazy"
            />
            {/* Play button overlay for list view */}
            {hovered && (
              <button
                onClick={handlePlayPause}
                className="absolute inset-0 bg-black bg-opacity-50 rounded flex items-center justify-center"
              >
                {isCurrentSong && isPlaying ? <FaPause size={12} /> : <FaPlay size={12} />}
              </button>
            )}
          </div>
          
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-white truncate">{song.title}</p>
            <p className="text-xs text-gray-400 truncate">{song.artist}</p>
          </div>
          
          <div className="flex items-center space-x-2">
            <span className="text-xs text-gray-500">{formatDuration(song.duration)}</span>
            <button
              onClick={handleLike}
              disabled={loading}
              className="p-1 hover:scale-110 transition"
            >
              {liked ? (
                <FaHeart className="text-green-500" size={14} />
              ) : (
                <FaHeartBroken className="text-gray-400" size={14} />
              )}
            </button>
          </div>
        </div>
      ) : (
        // Card/Grid view layout
        <>
          {/* Image Container */}
          <div className="relative">
            <img
              src={song.coverImage || '/assets/default-cover.jpg'}
              alt={song.title}
              className="w-full aspect-square object-cover rounded-lg mb-3"
              loading="lazy"
              onError={(e) => {
                e.target.src = '/assets/default-cover.jpg';
              }}
            />
            
            {/* Play Button Overlay - Shows on hover */}
            <div
              className={`absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center transition-opacity duration-300 rounded-lg ${
                hovered ? 'opacity-100' : 'opacity-0'
              }`}
            >
              <button
                onClick={handlePlayPause}
                className="w-12 h-12 rounded-full bg-green-500 text-black flex items-center justify-center hover:scale-110 transition transform"
                aria-label={isCurrentSong && isPlaying ? 'Pause' : 'Play'}
              >
                {isCurrentSong && isPlaying ? (
                  <FaPause size={20} />
                ) : (
                  <FaPlay size={20} className="ml-1" />
                )}
              </button>
            </div>

            {/* Like Button - Top right corner */}
            <button
              onClick={handleLike}
              disabled={loading}
              className={`absolute top-2 right-2 p-2 rounded-full bg-black bg-opacity-50 transition ${
                hovered ? 'opacity-100' : 'opacity-0'
              } hover:scale-110`}
              aria-label={liked ? 'Unlike' : 'Like'}
            >
              {liked ? (
                <FaHeart className="text-green-500" size={16} />
              ) : (
                <FaHeartBroken className="text-gray-400" size={16} />
              )}
            </button>

            {/* Currently Playing Animation Indicator */}
            {isCurrentSong && isPlaying && (
              <div className="absolute bottom-2 left-2 playing-animation">
                <span></span>
                <span></span>
                <span></span>
              </div>
            )}
          </div>

          {/* Song Information */}
          <div className="mt-2">
            <h3 className="text-sm font-medium text-white truncate" title={song.title}>
              {song.title}
            </h3>
            <p className="text-xs text-gray-400 truncate mt-1" title={song.artist}>
              {song.artist}
            </p>
            
            {/* Metadata Row */}
            <div className="flex items-center justify-between mt-2">
              <span className="text-xs text-gray-500">{formatDuration(song.duration)}</span>
              {song.plays > 0 && (
                <span className="text-xs text-gray-500">
                  {song.plays >= 1000 ? `${(song.plays / 1000).toFixed(1)}K` : song.plays} plays
                </span>
              )}
            </div>
            
            {/* Genre Tag (Optional) */}
            {song.genre && song.genre !== 'Other' && (
              <span className="inline-block mt-2 text-xs px-2 py-1 bg-gray-800 rounded-full text-gray-400">
                {song.genre}
              </span>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default SongCard;