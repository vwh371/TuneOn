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

  /**
   * Apply volume changes to audio element
   */
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);

  /**
   * Play a specific song
   * @param {Object} song - Song object to play
   * @param {Array} songsQueue - Optional custom queue
   */
  const playSong = (song, songsQueue = null) => {
    let newQueue = songsQueue || queue;
    let newIndex = newQueue.findIndex(s => s.id === song.id);
    
    // If song not in queue, create new queue with just this song
    if (newIndex === -1) {
      newQueue = [song];
      newIndex = 0;
    }
    
    setQueue(newQueue);
    setCurrentIndex(newIndex);
    setCurrentSong(song);
    setIsPlaying(true);
    
    // Update shuffled queue if shuffle is on
    if (isShuffled) {
      shuffleQueue(newQueue);
    }
  };

  /**
   * Play the next song in queue
   */
  const playNext = () => {
    let nextIndex = currentIndex + 1;
    const activeQueue = isShuffled ? shuffledQueue : queue;
    
    // Handle end of queue based on repeat mode
    if (nextIndex >= activeQueue.length) {
      if (repeatMode === 'all') {
        nextIndex = 0; // Loop back to start
      } else {
        pause();
        return;
      }
    }
    
    setCurrentIndex(nextIndex);
    setCurrentSong(activeQueue[nextIndex]);
    setIsPlaying(true);
  };
