import { useEffect, useMemo, useState } from "react";
import Header from "../components/Header";
import Sidebar from "../components/Sidebar";

const moods = ["focus", "chill", "workout", "party", "night", "study"];

export default function Home() {
  const [tracks, setTracks] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [selectedTrack, setSelectedTrack] = useState(null);
  const [status, setStatus] = useState("loading");
  const [suggestStatus, setSuggestStatus] = useState("loading");
  const [error, setError] = useState("");
  const [sourceLabel, setSourceLabel] = useState("TuneOn");
  const [activeMood, setActiveMood] = useState("focus");
  const [activeGenre, setActiveGenre] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchStatus, setSearchStatus] = useState("idle");
  const [searchError, setSearchError] = useState("");

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

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      window.location.replace("/");
      return;
    }

    const controller = new AbortController();

    async function loadTracks() {
      setStatus("loading");
      setError("");

      try {
        const response = await fetch("/api/tracks", { signal: controller.signal });
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "Could not load tracks");
        }

        setTracks(data.tracks || []);
        setStatus("ready");
      } catch (err) {
        if (err.name === "AbortError") {
          return;
        }

        setError(err.message || "Could not load tracks");
        setStatus("error");
      }
    }

    loadTracks();

    return () => controller.abort();
  }, []);

  useEffect(() => {
    const controller = new AbortController();

    async function loadRecommendations() {
      setSuggestStatus("loading");
      setError("");

      try {
        const params = new URLSearchParams({
          mood: activeMood,
          limit: "8",
        });

        if (activeGenre) {
          params.set("genre", activeGenre);
        }

        const externalSources = [
          { endpoint: "/api/youtube/recommendations", label: "YouTube" },
          { endpoint: "/api/spotify/recommendations", label: "Spotify" },
        ];

        for (const source of externalSources) {
          const response = await fetch(`${source.endpoint}?${params.toString()}`, {
            signal: controller.signal,
          });

          if (!response.ok) {
            continue;
          }

          const data = await response.json();
          const list = data.recommendations || [];

          if (list.length === 0) {
            continue;
          }

          setRecommendations(list);
          setSelectedTrack(list[0] || null);
          setSourceLabel(source.label);
          setSuggestStatus("ready");
          return;
        }

        const fallbackResponse = await fetch(`/api/recommendations?${params.toString()}`, {
          signal: controller.signal,
        });
        const fallbackData = await fallbackResponse.json();

        if (!fallbackResponse.ok) {
          throw new Error(fallbackData.error || "Could not load recommendations");
        }

        const fallbackList = (fallbackData.recommendations || []).map((item) => ({
          ...item,
          embedUrl: "",
          externalUrl: "",
          previewUrl: "",
          cover: "",
          album: "",
          source: "tuneon",
        }));

        setRecommendations(fallbackList);
        setSelectedTrack(fallbackList[0] || null);
        setSourceLabel("TuneOn fallback");
        setSuggestStatus("ready");
      } catch (err) {
        if (err.name === "AbortError") {
          return;
        }

        setError(err.message || "Could not load recommendations");
        setSuggestStatus("error");
      }
    }

    loadRecommendations();

    return () => controller.abort();
  }, [activeMood, activeGenre]);

  const featureTrack = selectedTrack || recommendations[0] || tracks[0];

  const topGenres = useMemo(() => {
    const seen = new Set();
    const list = [];

    tracks.forEach((track) => {
      if (!seen.has(track.genre)) {
        seen.add(track.genre);
        list.push(track.genre);
      }
    });

    return list.slice(0, 5);
  }, [tracks]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.location.replace("/");
  };

  const handleGenreClick = (genre) => {
    setActiveGenre((current) => (current === genre ? "" : genre));
  };

  const handleSearchSubmit = async (event) => {
    event.preventDefault();
    const query = searchQuery.trim();

    if (!query) {
      return;
    }

    setSearchStatus("loading");
    setSearchError("");

    try {
      const params = new URLSearchParams({ q: query, limit: "8" });
      const response = await fetch(`/api/youtube/search?${params.toString()}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Could not search songs");
      }

      const list = data.results || [];
      setSearchStatus("ready");
      setRecommendations(list);

      if (list.length > 0) {
        setSelectedTrack(list[0]);
        setSourceLabel("YouTube search");
      } else {
        setSelectedTrack(null);
        setSourceLabel("No results");
      }
    } catch (err) {
      setSearchStatus("error");
      setSearchError(err.message || "Could not search songs");
    }
  };

  return (
    <main className="min-h-screen overflow-hidden bg-[radial-gradient(circle_at_10%_15%,rgba(29,185,84,0.24),transparent_35%),radial-gradient(circle_at_90%_5%,rgba(59,130,246,0.2),transparent_28%),radial-gradient(circle_at_50%_120%,rgba(234,179,8,0.15),transparent_32%),linear-gradient(155deg,#040b08_0%,#091914_45%,#070f1a_100%)] px-4 py-8 pb-28 text-white sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-7xl flex-col gap-6 lg:flex-row">
        <Sidebar />

        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold uppercase tracking-[0.38em] text-[#1db954]">TuneOn</p>
          <h1 className="mt-3 text-4xl font-black tracking-tight sm:text-5xl">Good evening, {greetingName}.</h1>
          <p className="mt-4 max-w-2xl text-sm leading-7 text-white/70 sm:text-base">
            Your home feed adapts to mood and taste, so each refresh feels like a custom mix made for you.
          </p>

          <Header
            greetingName={greetingName}
            moods={moods}
            activeMood={activeMood}
            onMoodChange={setActiveMood}
            onLogout={handleLogout}
            searchQuery={searchQuery}
            onSearchQueryChange={setSearchQuery}
            onSearchSubmit={handleSearchSubmit}
            searchStatus={searchStatus}
          />

          <section className="mt-6 grid gap-6">
          <article className="rounded-4xl border border-white/12 bg-[#0b1211]/94 p-6 shadow-[0_24px_80px_rgba(0,0,0,0.45)] sm:p-8">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-2xl font-bold tracking-tight">Made for you</h2>
                <p className="mt-1 text-sm text-white/65">Suggestion engine: mood + genre + YouTube + Spotify discovery</p>
              </div>
              <span className="rounded-full border border-cyan-300/35 bg-cyan-300/15 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-cyan-100">
                {activeMood} mode
              </span>
            </div>

            <p className="mt-3 text-xs uppercase tracking-[0.22em] text-white/50">Source: {sourceLabel}</p>

            {searchStatus === "error" && (
              <p className="mt-4 rounded-2xl border border-red-400/35 bg-red-900/20 px-4 py-3 text-sm text-red-200">{searchError}</p>
            )}

            {topGenres.length > 0 && (
              <div className="mt-5 flex flex-wrap gap-2">
                {topGenres.map((genre) => (
                  <button
                    key={genre}
                    type="button"
                    onClick={() => handleGenreClick(genre)}
                    className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${
                      activeGenre === genre
                        ? "border border-amber-300/50 bg-amber-300/20 text-amber-100"
                        : "border border-white/15 bg-white/5 text-white/70 hover:bg-white/12"
                    }`}
                  >
                    {genre}
                  </button>
                ))}
              </div>
            )}

            {suggestStatus === "loading" && (
              <p className="mt-6 rounded-2xl border border-white/10 bg-white/5 px-4 py-4 text-sm text-white/75">Building personalized suggestions...</p>
            )}

            {suggestStatus === "error" && (
              <p className="mt-6 rounded-2xl border border-red-400/35 bg-red-900/20 px-4 py-4 text-sm text-red-200">{error}</p>
            )}

            {suggestStatus === "ready" && recommendations.length > 0 && (
              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                {recommendations.map((track) => (
                  <div
                    key={track.id}
                    className={`group rounded-2xl border bg-white/6 p-4 transition hover:-translate-y-0.5 hover:border-[#1db954]/45 hover:bg-white/10 ${
                      selectedTrack?.id === track.id ? "border-[#1db954]/50" : "border-white/10"
                    }`}
                    role="button"
                    tabIndex={0}
                    onClick={() => setSelectedTrack(track)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter" || event.key === " ") {
                        setSelectedTrack(track);
                      }
                    }}
                  >
                    <p className="text-xs uppercase tracking-[0.28em] text-white/45">{track.genre}</p>
                    <h3 className="mt-2 text-lg font-bold">{track.title}</h3>
                    <p className="mt-1 text-sm text-white/70">{track.artist}</p>
                    <div className="mt-4 flex items-center justify-between text-xs text-white/65">
                      <span>{track.bpm ? `${track.bpm} BPM` : track.album || "Playlist pick"}</span>
                      <span className="rounded-full border border-white/15 bg-white/8 px-2 py-1">{track.energy || "smart match"}</span>
                    </div>
                    <p className="mt-3 text-xs text-[#8ef2b1]">{track.reason}</p>
                  </div>
                ))}
              </div>
            )}
          </article>

            <section className="rounded-4xl border border-white/12 bg-[#0d1519]/95 p-6 shadow-[0_24px_80px_rgba(0,0,0,0.35)] sm:p-8">
              <h2 className="text-xl font-bold tracking-tight">Library pulse</h2>

              {status === "loading" && (
                <p className="mt-4 text-sm text-white/70">Loading library...</p>
              )}

              {status === "error" && (
                <p className="mt-4 text-sm text-red-200">{error}</p>
              )}

              {status === "ready" && (
                <div className="mt-4 grid gap-3">
                  <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                    <p className="text-xs uppercase tracking-[0.28em] text-white/45">Account</p>
                    <p className="mt-2 text-sm font-semibold text-white/90">{user?.email || "Signed in"}</p>
                  </div>

                  <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                    <p className="text-xs uppercase tracking-[0.28em] text-white/45">Tracks loaded</p>
                    <p className="mt-2 text-sm font-semibold text-white/90">{tracks.length}</p>
                  </div>

                  <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                    <p className="text-xs uppercase tracking-[0.28em] text-white/45">Top filter</p>
                    <p className="mt-2 text-sm font-semibold text-white/90">{activeGenre || "All genres"}</p>
                  </div>
                </div>
              )}
            </section>
          </section>
        </div>
      </div>

      {featureTrack?.embedUrl && (
        <iframe
          title={featureTrack?.source === "youtube" ? "YouTube Hidden Player" : "Spotify Hidden Player"}
          src={featureTrack?.source === "youtube" ? `${featureTrack.embedUrl}?autoplay=1` : featureTrack.embedUrl}
          className="h-0 w-0 border-0 opacity-0"
          allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
          loading="lazy"
        />
      )}

      {featureTrack && (
        <div className="fixed bottom-3 left-1/2 z-30 w-[min(1200px,calc(100%-1.5rem))] -translate-x-1/2 rounded-2xl border border-white/15 bg-[#1a1c1f]/96 px-4 py-3 shadow-[0_20px_60px_rgba(0,0,0,0.55)] backdrop-blur-xl sm:px-5">
          <div className="grid items-center gap-3 sm:grid-cols-[1fr_auto_auto]">
            <div className="flex min-w-0 items-center gap-3">
              {featureTrack.cover ? (
                <img src={featureTrack.cover} alt={featureTrack.title} className="h-11 w-11 rounded-md object-cover" />
              ) : (
                <div className="h-11 w-11 rounded-md bg-white/12" />
              )}
              <div className="min-w-0">
                <p className="truncate text-base font-bold leading-tight text-white">{featureTrack.title}</p>
                <p className="truncate text-sm text-white/60">{featureTrack.artist}</p>
              </div>
            </div>

            <div className="flex items-center justify-center gap-2 text-white/90">
              <button type="button" className="rounded-full p-2 transition hover:bg-white/10" aria-label="Previous track">
                <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true"><path fill="currentColor" d="M6 5.25a.75.75 0 011.2-.6l8.5 6.75a.75.75 0 010 1.2L7.2 19.35A.75.75 0 016 18.75V5.25zm10 0a.75.75 0 111.5 0v13.5a.75.75 0 11-1.5 0V5.25z"/></svg>
              </button>
              <button type="button" className="rounded-full bg-white p-2 text-black transition hover:scale-[1.03]" aria-label="Play in embedded player">
                <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true"><path fill="currentColor" d="M8.5 6.5v11l9-5.5-9-5.5z"/></svg>
              </button>
              <button type="button" className="rounded-full p-2 transition hover:bg-white/10" aria-label="Next track">
                <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true"><path fill="currentColor" d="M18 5.25a.75.75 0 00-1.2-.6l-8.5 6.75a.75.75 0 000 1.2l8.5 6.75a.75.75 0 001.2-.6V5.25zm-10 0a.75.75 0 10-1.5 0v13.5a.75.75 0 101.5 0V5.25z"/></svg>
              </button>
            </div>

            <div className="flex items-center justify-end gap-2">
              <p className="hidden text-xs uppercase tracking-[0.2em] text-white/45 sm:block">{sourceLabel}</p>
              {featureTrack.externalUrl && (
                <a
                  href={featureTrack.externalUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-full border border-white/20 bg-white/8 px-3 py-1.5 text-xs font-semibold text-white/85 transition hover:bg-white/14"
                >
                  Open
                </a>
              )}
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
