import { useEffect, useState } from "react";
import Login from "./pages/login";
import Register from "./pages/register";
import Home from "./pages/home";
import ResetPassword from "./pages/resetPassword";
import MusicPreferences from "./pages/musicPreferences";
import SongDetail from "./pages/songDetail";
import Sidebar from "./components/Sidebar";

function readPlayerState() {
  const raw = sessionStorage.getItem("playerState");
  if (!raw) {
    return { track: null, isPlaying: false };
  }

  try {
    const parsed = JSON.parse(raw);
    return {
      track: parsed?.track || null,
      isPlaying: Boolean(parsed?.isPlaying),
    };
  } catch {
    return { track: null, isPlaying: false };
  }
}

export default function App() {
  const [path, setPath] = useState(window.location.pathname);
  const [playerState, setPlayerState] = useState(() => readPlayerState());
  const token = localStorage.getItem("token");

  useEffect(() => {
    const handlePathChange = () => setPath(window.location.pathname);
    const handlePlayerStateChange = () => setPlayerState(readPlayerState());

    window.addEventListener("popstate", handlePathChange);
    window.addEventListener("app:navigate", handlePathChange);
    window.addEventListener("player-state-changed", handlePlayerStateChange);

    return () => {
      window.removeEventListener("popstate", handlePathChange);
      window.removeEventListener("app:navigate", handlePathChange);
      window.removeEventListener("player-state-changed", handlePlayerStateChange);
    };
  }, []);

  // Determine if we should show sidebar (on authenticated pages only)
  const showSidebar = token && (path.startsWith("/home") || path.startsWith("/song") || path.startsWith("/music-preferences"));

  return (
    <>
      {showSidebar && <Sidebar />}
      <AppContent path={path} token={token} />

      {playerState.track?.embedUrl && playerState.isPlaying && (
        <iframe
          title={playerState.track?.source === "youtube" ? "YouTube Hidden Player" : "Spotify Hidden Player"}
          src={playerState.track?.source === "youtube" ? `${playerState.track.embedUrl}?autoplay=1` : playerState.track.embedUrl}
          className="h-0 w-0 border-0 opacity-0"
          allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
          loading="lazy"
        />
      )}
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
