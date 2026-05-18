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

  /**
   * Play the previous song in queue
   */
  const playPrevious = () => {
    let prevIndex = currentIndex - 1;
    const activeQueue = isShuffled ? shuffledQueue : queue;
    
    if (prevIndex < 0) {
      if (repeatMode === 'all') {
        prevIndex = activeQueue.length - 1; // Go to end
      } else {
        return;
      }
    }
    
    setCurrentIndex(prevIndex);
    setCurrentSong(activeQueue[prevIndex]);
    setIsPlaying(true);
  };

  /**
   * Toggle play/pause
   */
  const togglePlay = () => {
    setIsPlaying(!isPlaying);
  };

  /**
   * Pause current playback
   */
  const pause = () => {
    setIsPlaying(false);
  };

  /**
   * Add song to end of queue
   * @param {Object} song - Song to add
   */
  const addToQueue = (song) => {
    setQueue(prev => [...prev, song]);
  };


  /**
   * Add song to play next (right after current)
   * @param {Object} song - Song to add
   */
  const addToQueueNext = (song) => {
    const newQueue = [...queue];
    newQueue.splice(currentIndex + 1, 0, song);
    setQueue(newQueue);
  };

    /**
   * Remove song from queue by index
   * @param {number} index - Index of song to remove
   */
  const removeFromQueue = (index) => {
    const newQueue = [...queue];
    newQueue.splice(index, 1);
    setQueue(newQueue);
    
    // Adjust current index if needed
    if (index < currentIndex) {
      setCurrentIndex(currentIndex - 1);
    } else if (index === currentIndex) {
      playNext();
    }
  };

   /**
   * Clear entire queue
   */
  const clearQueue = () => {
    setQueue([]);
    setCurrentIndex(-1);
    setCurrentSong(null);
    setIsPlaying(false);
  }

    /**
   * Shuffle the queue using Fisher-Yates algorithm
   * @param {Array} songs - Songs to shuffle (defaults to current queue)
   */
  const shuffleQueue = (songs = null) => {
    const songsToShuffle = songs || queue;
    const shuffled = [...songsToShuffle];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    setShuffledQueue(shuffled);
  };

  /**
   * Toggle shuffle mode
   */
  const toggleShuffle = () => {
    setIsShuffled(!isShuffled);
    if (!isShuffled && queue.length > 0) {
      shuffleQueue();
    }
  };

    /**
   * Handle audio time update event
   * @param {Event} e - Time update event
   */
  const handleTimeUpdate = (e) => {
    const currentTime = e.target.currentTime;
    const progressPercent = (currentTime / duration) * 100;
    setProgress(progressPercent);
  };

  /**
   * Seek to specific position
   * @param {number} value - Percentage (0-100) to seek to
   */
  const handleSeek = (value) => {
    if (audioRef.current && duration) {
      const seekTime = (value / 100) * duration;
      audioRef.current.currentTime = seekTime;
      setProgress(value);
    };
    
  /**
   * Handle song end event
   * Determines next action based on repeat mode
   */
  const handleSongEnd = () => {
    if (repeatMode === 'one') {
      // Repeat current song
      audioRef.current.currentTime = 0;
      audioRef.current.play();
    } else {
      // Play next song
      playNext();
    }
  };
  // Context value
  const value = {
    currentSong,        // Currently playing song object
    isPlaying,          // Boolean play status
    queue,              // Array of queued songs
    volume,             // Current volume level
    progress,           // Playback progress percentage
    duration,           // Total duration in seconds
    repeatMode,         // Current repeat mode
    isShuffled,         // Shuffle status
    audioRef,           // Reference to audio element
    
    // Playback controls
    playSong,
    playNext,
    playPrevious,
    togglePlay,
    pause,
    
    // Queue management
    addToQueue,
    addToQueueNext,
    removeFromQueue,
    clearQueue,
    
    // Settings
    setVolume,
    setRepeatMode,
    toggleShuffle,
    
    // Event handlers
    handleTimeUpdate,
    handleSeek,
    handleSongEnd,
    setDuration,
  };