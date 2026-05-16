/**
 * Music Player Context Provider
 * Manages the global music player state including queue, playback controls, and volume
 */
import React, { createContext, useState, useContext, useRef, useEffect } from 'react';

const PlayerContext = createContext();

export const usePlayer = () => {
  const context = useContext(PlayerContext);
  if (!context) {
    throw new Error('usePlayer must be used within PlayerProvider');
  }
  return context;
};

export const PlayerProvider = ({ children }) => {
  // Player State
  const [currentSong, setCurrentSong] = useState(null);      // Currently playing song
  const [isPlaying, setIsPlaying] = useState(false);         // Play/Pause status
  const [queue, setQueue] = useState([]);                    // Song queue
  const [currentIndex, setCurrentIndex] = useState(-1);      // Current song index in queue
  const [volume, setVolume] = useState(0.7);                 // Volume level (0-1)
  const [progress, setProgress] = useState(0);               // Playback progress percentage
  const [duration, setDuration] = useState(0);               // Total duration of current song
  const [repeatMode, setRepeatMode] = useState('off');       // 'off', 'one', 'all'
  const [isShuffled, setIsShuffled] = useState(false);       // Shuffle mode status
  const [shuffledQueue, setShuffledQueue] = useState([]);    // Shuffled version of queue
  
  const audioRef = useRef(null);  // Reference to audio element
