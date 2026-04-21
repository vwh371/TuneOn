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

        const response = await fetch(`/api/spotify/recommendations?${params.toString()}`, {
          signal: controller.signal,
        });

        if (response.ok) {
          const data = await response.json();
          const list = data.recommendations || [];
          setRecommendations(list);
          setSelectedTrack(list[0] || null);
          setSourceLabel("Spotify");
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

  return (
    <main className="min-h-screen overflow-hidden bg-[radial-gradient(circle_at_10%_15%,rgba(29,185,84,0.24),transparent_35%),radial-gradient(circle_at_90%_5%,rgba(59,130,246,0.2),transparent_28%),radial-gradient(circle_at_50%_120%,rgba(234,179,8,0.15),transparent_32%),linear-gradient(155deg,#040b08_0%,#091914_45%,#070f1a_100%)] px-4 py-8 text-white sm:px-6 lg:px-8">
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
          />

          <section className="mt-6 grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
          <article className="rounded-4xl border border-white/12 bg-[#0b1211]/94 p-6 shadow-[0_24px_80px_rgba(0,0,0,0.45)] sm:p-8">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-2xl font-bold tracking-tight">Made for you</h2>
                <p className="mt-1 text-sm text-white/65">Suggestion engine: mood + genre + Spotify discovery</p>
              </div>
              <span className="rounded-full border border-cyan-300/35 bg-cyan-300/15 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-cyan-100">
                {activeMood} mode
              </span>
            </div>

            <p className="mt-3 text-xs uppercase tracking-[0.22em] text-white/50">Source: {sourceLabel}</p>

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

          <aside className="space-y-6">
            <section className="rounded-4xl border border-white/12 bg-white/10 p-6 shadow-[0_24px_80px_rgba(0,0,0,0.35)] backdrop-blur-xl sm:p-8">
              <h2 className="text-2xl font-bold tracking-tight">Now playing</h2>

              <div className="mt-6 rounded-3xl border border-white/10 bg-black/20 p-5">
                {featureTrack?.cover ? (
                  <img
                    src={featureTrack.cover}
                    alt={featureTrack.title}
                    className="mx-auto h-44 w-44 rounded-2xl object-cover shadow-[0_20px_40px_rgba(0,0,0,0.45)]"
                  />
                ) : (
                  <div className="mx-auto h-36 w-36 rounded-full border-8 border-black/65 bg-[conic-gradient(from_180deg,#0b1210,#1a2f2a,#0b1210)] shadow-[inset_0_0_0_16px_rgba(255,255,255,0.05)]" />
                )}

                <p className="mt-5 text-xs font-semibold uppercase tracking-[0.34em] text-white/45">Featured track</p>
                <h3 className="mt-2 text-xl font-bold">{featureTrack?.title || "No track available"}</h3>
                <p className="mt-1 text-sm text-white/70">
                  {featureTrack ? `${featureTrack.artist} • ${featureTrack.genre}` : "Try refreshing the page."}
                </p>

                {featureTrack?.embedUrl && (
                  <iframe
                    title="Spotify Player"
                    src={featureTrack.embedUrl}
                    className="mt-4 h-38 w-full rounded-xl border border-white/10"
                    allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                    loading="lazy"
                  />
                )}

                {featureTrack?.externalUrl && (
                  <a
                    href={featureTrack.externalUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-4 inline-flex w-full items-center justify-center rounded-full border border-[#1db954]/45 bg-[#1db954]/20 px-4 py-2 text-sm font-semibold text-[#9cf6bb] transition hover:bg-[#1db954]/30"
                  >
                    Open in Spotify
                  </a>
                )}
              </div>
            </section>

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
          </aside>
          </section>
        </div>
      </div>
    </main>
  );
}
