import { useEffect, useMemo, useState } from "react";
import Header from "../components/Header";
import {
  announcePlayerCommand,
  formatTime,
  getPlayableUrl,
  readAudioState,
  readPlayerState,
} from "../playerState";

const moods = ["focus", "chill", "workout", "party", "night", "study"];

const lyricLibrary = {
  "city lights": [
    "City lights, breathe in the neon air",
    "Every turn feels like a signal flare",
    "Keep the pulse low, let the skyline glow",
    "We can drift all night and let it show",
  ],
  "paper boats": [
    "Paper boats on a midnight tide",
    "Soft words fold where the secrets hide",
    "If the current pulls, we don't fight the flow",
    "Let the quiet write what the heart still knows",
  ],
  "drift theory": [
    "All the static turns to rhythm now",
    "Floating steady through the city sound",
    "Hands up, keep the motion clean",
    "We are alive inside the in-between",
  ],
};

function normalize(value) {
  return String(value || "").trim().toLowerCase();
}

function getLyricsForTrack(track) {
  const key = normalize(track?.title);

  if (lyricLibrary[key]) {
    return lyricLibrary[key];
  }

  const artist = track?.artist ? ` by ${track.artist}` : "";
  return [
    `Now playing ${track?.title || "this track"}${artist}.`,
    "This is a placeholder lyric view until real lyrics are connected.",
    "The current player controls, queue, and seek bar stay in sync here.",
    "Use the Up Next panel to jump to another track in the current session.",
  ];
}

export default function SongDetail() {
  const [playerState, setPlayerState] = useState(() => readPlayerState());
  const [audioState, setAudioState] = useState(() => readAudioState());
  const [selectedTrack, setSelectedTrack] = useState(null);
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
  const playableUrl = getPlayableUrl(selectedTrack);
  const durationSeconds = audioState.duration || Number(selectedTrack?.durationMs || 0) / 1000;
  const queue = Array.isArray(playerState.queue) ? playerState.queue : [];
  const queueIndex = Math.max(0, queue.findIndex((track) => track?.id === selectedTrack?.id));
  const upNextTracks = queue.filter((track) => track?.id !== selectedTrack?.id).slice(queueIndex, queueIndex + 4);
  const recommendedTracks = queue.filter((track) => track?.id !== selectedTrack?.id).slice(0, 6);
  const lyricsLines = getLyricsForTrack(selectedTrack);

  useEffect(() => {
    const syncState = () => {
      const nextPlayerState = readPlayerState();
      const nextAudioState = readAudioState();
      setPlayerState(nextPlayerState);
      setAudioState(nextAudioState);

      const trackFromState = nextPlayerState.track || null;
      if (trackFromState) {
        setSelectedTrack(trackFromState);
      }
    };

    syncState();
    window.addEventListener("player-state-changed", syncState);
    window.addEventListener("audio-state-changed", syncState);

    return () => {
      window.removeEventListener("player-state-changed", syncState);
      window.removeEventListener("audio-state-changed", syncState);
    };
  }, []);

  const navigateTo = (path) => {
    window.history.pushState({}, "", path);
    window.dispatchEvent(new Event("app:navigate"));
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      window.location.replace("/");
      return;
    }

    // Get track from sessionStorage (passed from home page)
    const trackData = sessionStorage.getItem("selectedTrack");
    if (trackData) {
      try {
        const parsedTrack = JSON.parse(trackData);
        setSelectedTrack(parsedTrack);

        const currentState = readPlayerState();
        if (!currentState.track || currentState.track?.id !== parsedTrack?.id) {
          announcePlayerCommand({
            type: "set-track",
            track: parsedTrack,
            queue: [parsedTrack].filter(Boolean),
            currentIndex: 0,
            isPlaying: Boolean(currentState.isPlaying),
            showPopup: false,
          });
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
    announcePlayerCommand({ type: "toggle-popup", showPopup: true });
    navigateTo("/home");
  };

  const handleQueueTrackSelect = (track, index) => {
    if (!track) {
      return;
    }

    sessionStorage.setItem("selectedTrack", JSON.stringify(track));
    announcePlayerCommand({
      type: "set-track",
      track,
      queue,
      currentIndex: index,
      isPlaying: true,
      showPopup: false,
    });
    setSelectedTrack(track);
  };

  return (
    <>
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
                        {playerState.isPlaying && (
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
                        <div className="space-y-5 pt-6">
                          <div className="rounded-3xl border border-white/10 bg-white/5 p-4">
                            <div className="flex items-center justify-between gap-3 text-xs uppercase tracking-[0.24em] text-white/45">
                              <span>{formatTime(audioState.currentTime)}</span>
                              <span>{formatTime(durationSeconds)}</span>
                            </div>
                            <input
                              type="range"
                              min="0"
                              max={Math.max(durationSeconds || 0, 1)}
                              step="0.1"
                              value={Math.min(audioState.currentTime || 0, Math.max(durationSeconds || 0, 1))}
                              onChange={(event) => {
                                announcePlayerCommand({ type: "seek", time: Number(event.target.value) });
                              }}
                              disabled={!playableUrl}
                              className="mt-3 w-full accent-[#1db954] disabled:cursor-not-allowed disabled:opacity-50"
                              aria-label="Seek track"
                            />
                          </div>

                          <div className="flex flex-wrap items-center gap-3 pt-1">
                            <button
                              type="button"
                              onClick={() => announcePlayerCommand({ type: "toggle-shuffle" })}
                              className={`h-12 w-12 rounded-full border flex items-center justify-center transition ${
                                playerState.shuffle
                                  ? "border-[#1db954] bg-[#1db954]/15 text-[#8ef2b1]"
                                  : "border-white/30 text-white hover:border-white"
                              }`}
                              aria-label="Shuffle"
                            >
                              <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M16 3h5v5" />
                                <path d="M4 20l6-6" />
                                <path d="M4 4l16 16" />
                                <path d="M16 21h5v-5" />
                                <path d="M14 14l2-2 5 5" />
                                <path d="M4 4l6 6" />
                              </svg>
                            </button>

                            <button
                              type="button"
                              onClick={() => announcePlayerCommand({ type: "previous" })}
                              className="h-12 w-12 rounded-full border border-white/30 flex items-center justify-center text-white hover:border-white transition"
                              aria-label="Previous track"
                              disabled={!playableUrl}
                            >
                              <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M19 5v14l-8-7 8-7z" />
                                <path d="M5 5v14" />
                              </svg>
                            </button>

                            <button
                              onClick={() => {
                                announcePlayerCommand({ type: "toggle-play" });
                              }}
                              disabled={!playableUrl}
                              className="h-16 w-16 rounded-full bg-[#1db954] flex items-center justify-center text-white hover:bg-[#1ed760] transition transform hover:scale-105 disabled:cursor-not-allowed disabled:opacity-60"
                              aria-label={playerState.isPlaying ? "Pause" : "Play"}
                            >
                              {playerState.isPlaying ? (
                                <svg className="h-8 w-8" viewBox="0 0 24 24" fill="currentColor">
                                  <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
                                </svg>
                              ) : (
                                <svg className="h-8 w-8 ml-1" viewBox="0 0 24 24" fill="currentColor">
                                  <path d="M8 5v14l11-7z" />
                                </svg>
                              )}
                            </button>

                            <button
                              type="button"
                              onClick={() => announcePlayerCommand({ type: "next" })}
                              className="h-12 w-12 rounded-full border border-white/30 flex items-center justify-center text-white hover:border-white transition"
                              aria-label="Next track"
                              disabled={!playableUrl}
                            >
                              <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M5 5v14l8-7-8-7z" />
                                <path d="M19 5v14" />
                              </svg>
                            </button>

                            <button
                              type="button"
                              onClick={() => announcePlayerCommand({ type: "cycle-repeat" })}
                              className={`h-12 w-12 rounded-full border flex items-center justify-center transition ${
                                playerState.repeatMode !== "off"
                                  ? "border-[#1db954] bg-[#1db954]/15 text-[#8ef2b1]"
                                  : "border-white/30 text-white hover:border-white"
                              }`}
                              aria-label="Repeat"
                            >
                              <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M7 7h10l-2-2m2 2-2 2" />
                                <path d="M17 17H7l2 2m-2-2 2-2" />
                              </svg>
                            </button>
                          </div>

                          <p className="text-sm text-white/65">
                            {selectedTrack?.reason || "Playback controls are available here and in the popup player."}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
                    <section className="rounded-3xl border border-white/10 bg-white/5 p-5">
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <p className="text-xs uppercase tracking-[0.28em] text-white/45">Up Next</p>
                          <h2 className="mt-2 text-xl font-bold text-white">Coming up in this queue</h2>
                        </div>
                        <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs uppercase tracking-[0.24em] text-white/55">
                          {Math.max(queue.length - 1, 0)} queued
                        </span>
                      </div>

                      <div className="mt-5 space-y-3">
                        {upNextTracks.length > 0 ? (
                          upNextTracks.map((track) => {
                            const index = queue.findIndex((item) => item?.id === track?.id);

                            return (
                              <button
                                key={track.id}
                                type="button"
                                onClick={() => handleQueueTrackSelect(track, index >= 0 ? index : 0)}
                                className="flex w-full items-center gap-4 rounded-2xl border border-white/10 bg-black/20 p-3 text-left transition hover:border-[#1db954]/40 hover:bg-white/8"
                              >
                                <div className="h-14 w-14 shrink-0 overflow-hidden rounded-xl bg-white/8">
                                  {track.cover ? (
                                    <img src={track.cover} alt={track.title} className="h-full w-full object-cover" />
                                  ) : null}
                                </div>
                                <div className="min-w-0 flex-1">
                                  <p className="truncate font-semibold text-white">{track.title}</p>
                                  <p className="truncate text-sm text-white/60">{track.artist}</p>
                                </div>
                                <span className="rounded-full border border-white/10 px-3 py-1 text-[10px] uppercase tracking-[0.22em] text-white/55">
                                  {track.genre || "Track"}
                                </span>
                              </button>
                            );
                          })
                        ) : (
                          <p className="rounded-2xl border border-white/10 bg-black/20 p-4 text-sm text-white/60">
                            Queue will appear here once you start a recommendation set from Home.
                          </p>
                        )}
                      </div>
                    </section>

                    <section className="rounded-3xl border border-white/10 bg-white/5 p-5">
                      <p className="text-xs uppercase tracking-[0.28em] text-white/45">Recommended</p>
                      <h2 className="mt-2 text-xl font-bold text-white">More from this session</h2>

                      <div className="mt-5 grid gap-3">
                        {recommendedTracks.length > 0 ? (
                          recommendedTracks.map((track) => {
                            const index = queue.findIndex((item) => item?.id === track?.id);

                            return (
                              <button
                                key={track.id}
                                type="button"
                                onClick={() => handleQueueTrackSelect(track, index >= 0 ? index : 0)}
                                className="flex items-center gap-3 rounded-2xl border border-white/10 bg-black/20 p-3 text-left transition hover:border-[#1db954]/40 hover:bg-white/8"
                              >
                                <div className="h-12 w-12 shrink-0 overflow-hidden rounded-xl bg-white/8">
                                  {track.cover ? (
                                    <img src={track.cover} alt={track.title} className="h-full w-full object-cover" />
                                  ) : null}
                                </div>
                                <div className="min-w-0 flex-1">
                                  <p className="truncate text-sm font-semibold text-white">{track.title}</p>
                                  <p className="truncate text-xs text-white/60">{track.artist}</p>
                                </div>
                              </button>
                            );
                          })
                        ) : (
                          <p className="rounded-2xl border border-white/10 bg-black/20 p-4 text-sm text-white/60">
                            Recommended tracks will appear here after you open a session from Home.
                          </p>
                        )}
                      </div>
                    </section>
                  </div>

                  <section className="rounded-3xl border border-white/10 bg-white/5 p-5">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="text-xs uppercase tracking-[0.28em] text-white/45">Lyrics</p>
                        <h2 className="mt-2 text-xl font-bold text-white">Sing along</h2>
                      </div>
                      <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs uppercase tracking-[0.24em] text-white/55">
                        {selectedTrack?.title || "Track"}
                      </span>
                    </div>

                    <div className="mt-5 space-y-3 rounded-3xl border border-white/10 bg-black/20 p-5">
                      {lyricsLines.map((line) => (
                        <p key={line} className="text-sm leading-7 text-white/75 sm:text-base">
                          {line}
                        </p>
                      ))}
                    </div>
                  </section>
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
    </>
  );
}
