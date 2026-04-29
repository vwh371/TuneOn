import { useEffect, useRef, useState } from "react";
import Login from "./pages/login";
import Register from "./pages/register";
import Home from "./pages/home";
import ResetPassword from "./pages/resetPassword";
import MusicPreferences from "./pages/musicPreferences";
import SongDetail from "./pages/songDetail";
import Sidebar from "./components/Sidebar";
import {
  announcePlayerCommand,
  formatTime,
  getNextTrack,
  getPlayableUrl,
  getPreviousTrack,
  readAudioState,
  readPlayerState,
  writeAudioState,
  writePlayerState,
} from "./playerState";

export default function App() {
  const [path, setPath] = useState(window.location.pathname);
  const [playerState, setPlayerState] = useState(() => readPlayerState());
  const [audioState, setAudioState] = useState(() => readAudioState());
  const token = localStorage.getItem("token");
  const audioRef = useRef(null);

  const syncFromSession = () => {
    setPlayerState(readPlayerState());
    setAudioState(readAudioState());
  };

  useEffect(() => {
    const handlePathChange = () => setPath(window.location.pathname);
    const handlePlayerStateChange = () => setPlayerState(readPlayerState());
    const handleAudioStateChange = () => setAudioState(readAudioState());
    const handleCommand = (event) => {
      const command = event.detail || {};
      const currentState = readPlayerState();
      const queue = Array.isArray(command.queue) ? command.queue : currentState.queue;
      const currentIndex = Number.isFinite(Number(command.currentIndex))
        ? Number(command.currentIndex)
        : currentState.currentIndex;
      const currentTrack = command.track || currentState.track || queue[currentIndex] || null;
      const playableUrl = getPlayableUrl(currentTrack);
      const audio = audioRef.current;

      const startAudio = (track, currentTime = 0) => {
        if (!audio) {
          return;
        }

        const nextUrl = getPlayableUrl(track);
        if (!nextUrl) {
          return;
        }

        if (audio.src !== nextUrl) {
          audio.src = nextUrl;
        }

        audio.currentTime = Math.max(0, Number(currentTime) || 0);
        audio.loop = currentState.repeatMode === "one";

        const playPromise = audio.play();
        if (playPromise && typeof playPromise.catch === "function") {
          playPromise.catch(() => {});
        }
      };

      if (command.type === "set-track") {
        writePlayerState({
          ...currentState,
          track: command.track || null,
          queue: Array.isArray(command.queue) ? command.queue : [command.track || null].filter(Boolean),
          currentIndex: Number.isFinite(Number(command.currentIndex)) ? Number(command.currentIndex) : 0,
          isPlaying: Boolean(command.isPlaying ?? true),
          showPopup: Boolean(command.showPopup ?? false),
          shuffle: Boolean(command.shuffle ?? currentState.shuffle),
          repeatMode: ["off", "all", "one"].includes(command.repeatMode) ? command.repeatMode : currentState.repeatMode,
        });
        writeAudioState({ currentTime: Number(command.currentTime) || 0, ready: false, duration: 0, sourceUrl: playableUrl });

        if (Boolean(command.isPlaying ?? true) && playableUrl) {
          startAudio(currentTrack, Number(command.currentTime) || 0);
        } else if (audio) {
          audio.pause();
        }
        return;
      }

      if (!currentTrack) {
        return;
      }

      if (command.type === "toggle-play") {
        writePlayerState({ ...currentState, isPlaying: !currentState.isPlaying });
        return;
      }

      if (command.type === "play") {
        writePlayerState({ ...currentState, isPlaying: true, track: currentTrack });
        return;
      }

      if (command.type === "pause") {
        writePlayerState({ ...currentState, isPlaying: false });
        return;
      }

      if (command.type === "seek") {
        const nextTime = Math.max(0, Number(command.time) || 0);
        if (audio) {
          audio.currentTime = nextTime;
        }
        writeAudioState({ ...readAudioState(), currentTime: nextTime });
        return;
      }

      if (command.type === "toggle-shuffle") {
        writePlayerState({ ...currentState, shuffle: !currentState.shuffle });
        return;
      }

      if (command.type === "cycle-repeat") {
        const nextRepeat = currentState.repeatMode === "off" ? "all" : currentState.repeatMode === "all" ? "one" : "off";
        writePlayerState({ ...currentState, repeatMode: nextRepeat });
        return;
      }

      if (command.type === "next" || command.type === "previous") {
        if (queue.length === 0) {
          return;
        }

        const resolved = command.type === "next"
          ? getNextTrack(queue, currentIndex, currentState.shuffle)
          : getPreviousTrack(queue, currentIndex);

        if (!resolved.track) {
          return;
        }

        writePlayerState({
          ...currentState,
          track: resolved.track,
          currentIndex: resolved.index,
          isPlaying: true,
          showPopup: currentState.showPopup,
        });
        writeAudioState({ currentTime: 0, duration: 0, ready: false, sourceUrl: getPlayableUrl(resolved.track) });

        startAudio(resolved.track, 0);
        return;
      }

      if (command.type === "toggle-popup") {
        writePlayerState({ ...currentState, showPopup: Boolean(command.showPopup) });
      }
    };

    window.addEventListener("popstate", handlePathChange);
    window.addEventListener("app:navigate", handlePathChange);
    window.addEventListener("player-state-changed", handlePlayerStateChange);
    window.addEventListener("audio-state-changed", handleAudioStateChange);
    window.addEventListener("tuneon:player-command", handleCommand);

    return () => {
      window.removeEventListener("popstate", handlePathChange);
      window.removeEventListener("app:navigate", handlePathChange);
      window.removeEventListener("player-state-changed", handlePlayerStateChange);
      window.removeEventListener("audio-state-changed", handleAudioStateChange);
      window.removeEventListener("tuneon:player-command", handleCommand);
    };
  }, []);

  useEffect(() => {
    const audio = audioRef.current;

    if (!audio) {
      return;
    }

    const playableUrl = getPlayableUrl(playerState.track);

    if (playableUrl) {
      if (audio.src !== playableUrl) {
        audio.src = playableUrl;
        audio.currentTime = Number(audioState.currentTime) || 0;
      }

      audio.loop = playerState.repeatMode === "one";

      if (playerState.isPlaying) {
        const playPromise = audio.play();
        if (playPromise && typeof playPromise.catch === "function") {
          playPromise.catch(() => {});
        }
      } else {
        audio.pause();
      }
    } else {
      audio.pause();
      audio.removeAttribute("src");
      audio.load();
    }
  }, [playerState.isPlaying, playerState.repeatMode, playerState.track]);

  useEffect(() => {
    const audio = audioRef.current;

    if (!audio) {
      return;
    }

    const handleLoadedMetadata = () => {
      writeAudioState({
        currentTime: Number(audio.currentTime) || 0,
        duration: Number(audio.duration) || 0,
        ready: true,
        sourceUrl: audio.src || "",
      });
    };

    const handleTimeUpdate = () => {
      writeAudioState({
        currentTime: Number(audio.currentTime) || 0,
        duration: Number(audio.duration) || 0,
        ready: Boolean(audio.readyState >= 2),
        sourceUrl: audio.src || "",
      });
    };

    const handleEnded = () => {
      const current = readPlayerState();
      if (current.repeatMode === "one") {
        audio.currentTime = 0;
        const playPromise = audio.play();
        if (playPromise && typeof playPromise.catch === "function") {
          playPromise.catch(() => {});
        }
        return;
      }

      if (current.queue.length > 1) {
        const resolved = current.shuffle ? getNextTrack(current.queue, current.currentIndex, true) : getNextTrack(current.queue, current.currentIndex, false);
        writePlayerState({ ...current, track: resolved.track, currentIndex: resolved.index, isPlaying: true });
        writeAudioState({ currentTime: 0, duration: 0, ready: false, sourceUrl: getPlayableUrl(resolved.track) });
        return;
      }

      if (current.repeatMode === "all" && current.queue.length > 0) {
        const resolved = getNextTrack(current.queue, current.currentIndex, false);
        writePlayerState({ ...current, track: resolved.track, currentIndex: resolved.index, isPlaying: true });
        writeAudioState({ currentTime: 0, duration: 0, ready: false, sourceUrl: getPlayableUrl(resolved.track) });
        return;
      }

      writePlayerState({ ...current, isPlaying: false });
    };

    audio.addEventListener("loadedmetadata", handleLoadedMetadata);
    audio.addEventListener("timeupdate", handleTimeUpdate);
    audio.addEventListener("ended", handleEnded);

    return () => {
      audio.removeEventListener("loadedmetadata", handleLoadedMetadata);
      audio.removeEventListener("timeupdate", handleTimeUpdate);
      audio.removeEventListener("ended", handleEnded);
    };
  }, [audioRef, playerState.queue, playerState.currentIndex, playerState.repeatMode, playerState.shuffle]);

  // Determine if we should show sidebar (on authenticated pages only)
  const showSidebar = token && (path.startsWith("/home") || path.startsWith("/song") || path.startsWith("/music-preferences"));

  return (
    <>
      {showSidebar && <Sidebar />}
      <AppContent path={path} token={token} />

      {getPlayableUrl(playerState.track) ? (
        <audio ref={(node) => {
          audioRef.current = node;
        }} preload="auto" className="hidden" />
      ) : playerState.track?.embedUrl && playerState.isPlaying ? (
        <iframe
          title={playerState.track?.source === "youtube" ? "YouTube Hidden Player" : "Spotify Hidden Player"}
          src={playerState.track?.source === "youtube" ? `${playerState.track.embedUrl}?autoplay=1` : playerState.track.embedUrl}
          className="h-0 w-0 border-0 opacity-0"
          allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
          loading="lazy"
        />
      ) : null}
    </>
  );
}

function AppContent({ path, token }) {
  if (path.startsWith("/song")) {
    if (!token) {
      window.location.replace("/");
      return null;
    }

    return <SongDetail />;
  }

  if (path.startsWith("/home")) {
    return <Home />;
  }

  if (path.startsWith("/music-preferences")) {
    if (!token) {
      window.location.replace("/register");
      return null;
    }

    return <MusicPreferences />;
  }

  if (path.startsWith("/register")) {
    if (token) {
      window.location.replace("/home");
      return null;
    }

    return <Register />;
  }

  if (path.startsWith("/reset-password")) {
    if (token) {
      window.location.replace("/home");
      return null;
    }

    return <ResetPassword />;
  }

  if (token) {
    window.location.replace("/home");
    return null;
  }

  return <Login />;
}
