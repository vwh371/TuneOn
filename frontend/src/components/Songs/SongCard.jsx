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