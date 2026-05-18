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
