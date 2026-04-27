import { useEffect, useState, useMemo } from "react";
import Header from "../components/Header";

const moods = ["focus", "chill", "workout", "party", "night", "study"];

export default function SongDetail() {
  const [selectedTrack, setSelectedTrack] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchStatus, setSearchStatus] = useState("idle");
  const [activeMood, setActiveMood] = useState("focus");

  const user = useMemo(() => {
    const stored = localStorage.getItem("user");
    if (!stored) {
      return null;
    }
    try {
      return JSON.parse(stored);
    } catch {
      return null;
    }
  }, []);

  const greetingName = user?.name || "Listener";

  const navigateTo = (path) => {
    window.history.pushState({}, "", path);
    window.dispatchEvent(new Event("app:navigate"));
  };

  const savePlayerState = (track, playing, showPopup) => {
    sessionStorage.setItem(
      "playerState",
      JSON.stringify({
        track,
        isPlaying: Boolean(playing),
        showPopup: Boolean(showPopup),
      }),
    );
    window.dispatchEvent(new Event("player-state-changed"));
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      window.location.replace("/");
      return;
    }

    // Get track from sessionStorage (passed from home page)
    const trackData = sessionStorage.getItem("selectedTrack");
    const playerStateData = sessionStorage.getItem("playerState");
    if (trackData) {
      try {
        const parsedTrack = JSON.parse(trackData);
        setSelectedTrack(parsedTrack);

        if (playerStateData) {
          try {
            const playerState = JSON.parse(playerStateData);
            setIsPlaying(Boolean(playerState?.isPlaying));
            savePlayerState(parsedTrack, Boolean(playerState?.isPlaying), false);
          } catch {
            setIsPlaying(Boolean(parsedTrack?.embedUrl));
            savePlayerState(parsedTrack, Boolean(parsedTrack?.embedUrl), false);
          }
        } else {
          setIsPlaying(Boolean(parsedTrack?.embedUrl));
          savePlayerState(parsedTrack, Boolean(parsedTrack?.embedUrl), false);
        }
      } catch (err) {
        console.error("Could not load song details");
      }
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.location.replace("/");
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) {
      return;
    }
    setSearchStatus("loading");
    // Implement search functionality here
    setSearchStatus("idle");
  };

  const handleMoodChange = (mood) => {
    setActiveMood(mood);
  };

  const handleGoBack = () => {
    if (selectedTrack) {
      savePlayerState(selectedTrack, isPlaying, true);
    }
    navigateTo("/home");
  };

  return (
    <main className="min-h-screen overflow-hidden bg-[radial-gradient(circle_at_10%_15%,rgba(29,185,84,0.24),transparent_35%),radial-gradient(circle_at_90%_5%,rgba(59,130,246,0.2),transparent_28%),radial-gradient(circle_at_50%_120%,rgba(234,179,8,0.15),transparent_32%),linear-gradient(155deg,#040b08_0%,#091914_45%,#070f1a_100%)] px-4 py-8 pb-28 text-white sm:px-6 lg:px-8 ml-20">
      <div className="mx-auto max-w-7xl flex-col gap-6">
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="mt-3 text-4xl font-black tracking-tight sm:text-5xl">
                {selectedTrack?.title || "Loading..."}
              </h1>
              <p className="mt-4 max-w-2xl text-sm leading-7 text-white/70 sm:text-base">
                {selectedTrack?.artist || ""}
              </p>
            </div>
            <button
              onClick={handleGoBack}
              className="h-12 w-12 rounded-full border border-white/20 flex items-center justify-center text-white hover:bg-white/10 transition"
              aria-label="Go back"
            >
              <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M19 12H5M12 19l-7-7 7-7" />
              </svg>
            </button>
          </div>

          <Header
            greetingName={greetingName}
            moods={moods}
            activeMood={activeMood}
            onMoodChange={handleMoodChange}
            onLogout={handleLogout}
            searchQuery={searchQuery}
            onSearchQueryChange={setSearchQuery}
            onSearchSubmit={handleSearchSubmit}
            searchStatus={searchStatus}
          />

          <section className="mt-6 grid gap-6">
            <article className="rounded-4xl border border-white/12 bg-[#0b1211]/94 p-6 shadow-[0_24px_80px_rgba(0,0,0,0.45)] sm:p-8">
              {selectedTrack ? (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
                    {/* Album Art */}
                    <div className="flex justify-center md:col-span-1">
                      <div className="relative">
                        <img
                          src={selectedTrack.cover || "https://via.placeholder.com/300?text=Album+Cover"}
                          alt={selectedTrack.title}
                          className="h-72 w-72 rounded-2xl shadow-2xl object-cover"
                        />
                        {isPlaying && (
                          <div className="absolute inset-0 rounded-2xl bg-black/20 flex items-center justify-center">
                            <div className="animate-pulse text-[#1db954]">
                              <svg className="h-16 w-16" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M8 5v14l11-7z" />
                              </svg>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Song Details */}
                    <div className="md:col-span-2 flex flex-col justify-center">
                      <div className="space-y-4">
                        <div>
                          <p className="text-xs uppercase text-white/50 font-semibold mb-2">Artist</p>
                          <p className="text-2xl font-bold text-white">{selectedTrack.artist || "Unknown Artist"}</p>
                        </div>

                        {/* Song Meta Information */}
                        <div className="grid grid-cols-2 gap-4 pb-6 border-b border-white/10">
                          {selectedTrack.album && (
                            <div>
                              <p className="text-xs uppercase text-white/50 font-semibold mb-1">Album</p>
                              <p className="text-white">{selectedTrack.album}</p>
                            </div>
                          )}
                          {selectedTrack.genre && (
                            <div>
                              <p className="text-xs uppercase text-white/50 font-semibold mb-1">Genre</p>
                              <p className="text-white">{selectedTrack.genre}</p>
                            </div>
                          )}
                          {selectedTrack.duration && (
                            <div>
                              <p className="text-xs uppercase text-white/50 font-semibold mb-1">Duration</p>
                              <p className="text-white">{selectedTrack.duration}</p>
                            </div>
                          )}
                          {selectedTrack.releaseDate && (
                            <div>
                              <p className="text-xs uppercase text-white/50 font-semibold mb-1">Released</p>
                              <p className="text-white">{selectedTrack.releaseDate}</p>
                            </div>
                          )}
                        </div>

                        {/* Player Controls */}
                        <div className="flex items-center gap-4 pt-6">
                          <button
                            onClick={() => {
                              const next = !isPlaying;
                              setIsPlaying(next);

                              if (selectedTrack) {
                                savePlayerState(selectedTrack, next, false);
                              }
                            }}
                            className="h-16 w-16 rounded-full bg-[#1db954] flex items-center justify-center text-white hover:bg-[#1ed760] transition transform hover:scale-105"
                          >
                            {isPlaying ? (
                              <svg className="h-8 w-8 ml-1" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
                              </svg>
                            ) : (
                              <svg className="h-8 w-8 ml-1" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M8 5v14l11-7z" />
                              </svg>
                            )}
                          </button>

                          <button className="h-12 w-12 rounded-full border-2 border-white/30 flex items-center justify-center text-white hover:border-white transition">
                            <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                            </svg>
                          </button>

                          <button className="h-12 w-12 rounded-full border-2 border-white/30 flex items-center justify-center text-white hover:border-white transition">
                            <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <circle cx="12" cy="12" r="1" />
                              <circle cx="19" cy="12" r="1" />
                              <circle cx="5" cy="12" r="1" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-12">
                  <p className="text-white/60 mb-4">No song selected</p>
                  <button
                    onClick={handleGoBack}
                    className="rounded-lg bg-[#1db954] px-6 py-2 text-white font-semibold hover:bg-[#1ed760]"
                  >
                    Go Back
                  </button>
                </div>
              )}
            </article>
          </section>
        </div>
      </div>

    </main>
  );
}
