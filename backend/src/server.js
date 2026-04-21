import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import { getUserByEmail, createUser } from "./db.js";
import { hashPassword, comparePasswords, generateToken, authMiddleware } from "./auth.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, "../.env") });

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const spotifyClientId = process.env.SPOTIFY_CLIENT_ID || "";
const spotifyClientSecret = process.env.SPOTIFY_CLIENT_SECRET || "";
const youtubeApiKey = process.env.YOUTUBE_API_KEY || "";
let spotifyTokenCache = {
  accessToken: "",
  expiresAt: 0,
};

const tracks = [
  {
    id: 1,
    title: "City Lights",
    artist: "Nova Street",
    genre: "Synthwave",
    bpm: 110,
    energy: "medium",
    moods: ["focus", "night", "chill"],
  },
  {
    id: 2,
    title: "Paper Boats",
    artist: "Aria Coast",
    genre: "Indie Pop",
    bpm: 96,
    energy: "low",
    moods: ["chill", "study", "focus"],
  },
  {
    id: 3,
    title: "Drift Theory",
    artist: "Mono Pulse",
    genre: "Electronic",
    bpm: 126,
    energy: "high",
    moods: ["party", "workout", "night"],
  },
  {
    id: 4,
    title: "Quiet Riot",
    artist: "Hollow Frames",
    genre: "Alt Rock",
    bpm: 128,
    energy: "high",
    moods: ["workout", "party"],
  },
  {
    id: 5,
    title: "Velvet Echo",
    artist: "Luna Archive",
    genre: "R&B",
    bpm: 88,
    energy: "low",
    moods: ["chill", "night"],
  },
  {
    id: 6,
    title: "Glass Horizon",
    artist: "North Loop",
    genre: "Lo-fi",
    bpm: 80,
    energy: "low",
    moods: ["study", "focus", "chill"],
  },
  {
    id: 7,
    title: "Gravity Run",
    artist: "Kinetic Bloom",
    genre: "Dance",
    bpm: 132,
    energy: "high",
    moods: ["workout", "party"],
  },
  {
    id: 8,
    title: "Neon Harbor",
    artist: "Frame Atlas",
    genre: "Hip-Hop",
    bpm: 102,
    energy: "medium",
    moods: ["night", "focus"],
  },
  {
    id: 9,
    title: "Sundown Script",
    artist: "Willow Fable",
    genre: "Acoustic",
    bpm: 84,
    energy: "low",
    moods: ["chill", "study"],
  },
  {
    id: 10,
    title: "Core Pulse",
    artist: "Ion District",
    genre: "Electronic",
    bpm: 124,
    energy: "high",
    moods: ["focus", "workout", "party"],
  },
];

const recommendationReasons = {
  mood: "Matches your selected mood",
  genre: "Based on your recent genre taste",
  trending: "Trending on TuneOn this week",
};

function getRecommendations({ mood = "focus", genre = "", limit = 6 }) {
  const normalizedMood = String(mood).toLowerCase();
  const normalizedGenre = String(genre).toLowerCase();
  const safeLimit = Math.max(1, Math.min(Number(limit) || 6, 12));

  const scoredTracks = tracks.map((track) => {
    let score = 0;
    const reasons = [];

    if (track.moods.some((tag) => tag.toLowerCase() === normalizedMood)) {
      score += 3;
      reasons.push(recommendationReasons.mood);
    }

    if (normalizedGenre && track.genre.toLowerCase() === normalizedGenre) {
      score += 2;
      reasons.push(recommendationReasons.genre);
    }

    if (track.energy === "high") {
      score += 1;
    }

    const trendingBoost = track.id % 3 === 0 ? 2 : 1;
    score += trendingBoost;

    if (trendingBoost > 1) {
      reasons.push(recommendationReasons.trending);
    }

    return {
      ...track,
      score,
      reason: reasons[0] || recommendationReasons.trending,
    };
  });

  return scoredTracks
    .sort((a, b) => b.score - a.score || a.bpm - b.bpm)
    .slice(0, safeLimit);
}

async function getSpotifyAccessToken() {
  if (!spotifyClientId || !spotifyClientSecret) {
    throw new Error("Spotify credentials are missing. Set SPOTIFY_CLIENT_ID and SPOTIFY_CLIENT_SECRET in backend/.env.");
  }

  const now = Date.now();
  if (spotifyTokenCache.accessToken && now < spotifyTokenCache.expiresAt) {
    return spotifyTokenCache.accessToken;
  }

  const tokenBody = new URLSearchParams({ grant_type: "client_credentials" });
  const authHeader = Buffer.from(`${spotifyClientId}:${spotifyClientSecret}`).toString("base64");

  const response = await fetch("https://accounts.spotify.com/api/token", {
    method: "POST",
    headers: {
      Authorization: `Basic ${authHeader}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: tokenBody,
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error_description || "Unable to fetch Spotify access token");
  }

  spotifyTokenCache = {
    accessToken: data.access_token,
    expiresAt: Date.now() + (data.expires_in - 30) * 1000,
  };

  return spotifyTokenCache.accessToken;
}

function moodToSpotifyQuery(mood) {
  const moodMap = {
    focus: "genre:lo-fi OR genre:ambient OR genre:instrumental",
    chill: "genre:chill OR genre:indie OR genre:r-n-b",
    workout: "genre:workout OR genre:dance OR genre:edm",
    party: "genre:party OR genre:dancehall OR genre:pop",
    night: "genre:synthwave OR genre:hip-hop OR genre:r-n-b",
    study: "genre:study OR genre:classical OR genre:lo-fi",
  };

  return moodMap[String(mood).toLowerCase()] || moodMap.focus;
}

function moodToYouTubeQuery(mood) {
  const moodMap = {
    focus: "lofi beats instrumental focus music",
    chill: "chill music mix",
    workout: "workout motivation music mix",
    party: "party hits music mix",
    night: "late night vibes music mix",
    study: "study music concentration mix",
  };

  return moodMap[String(mood).toLowerCase()] || moodMap.focus;
}

function toSpotifyTrack(item) {
  const image = item.album?.images?.[0]?.url || "";
  const artistNames = (item.artists || []).map((artist) => artist.name).join(", ");

  return {
    id: item.id,
    title: item.name,
    artist: artistNames,
    genre: "Spotify",
    album: item.album?.name || "",
    cover: image,
    previewUrl: item.preview_url,
    externalUrl: item.external_urls?.spotify || "",
    embedUrl: `https://open.spotify.com/embed/track/${item.id}`,
    durationMs: item.duration_ms,
    explicit: Boolean(item.explicit),
    popularity: item.popularity,
    source: "spotify",
    reason: "Suggested from Spotify based on your selected mood",
  };
}

function toYouTubeTrack(item) {
  const videoId = item.id?.videoId;

  if (!videoId) {
    return null;
  }

  const thumb =
    item.snippet?.thumbnails?.high?.url ||
    item.snippet?.thumbnails?.medium?.url ||
    item.snippet?.thumbnails?.default?.url ||
    "";

  return {
    id: `yt_${videoId}`,
    title: item.snippet?.title || "Untitled",
    artist: item.snippet?.channelTitle || "YouTube Creator",
    genre: "YouTube Music",
    album: item.snippet?.channelTitle || "",
    cover: thumb,
    previewUrl: "",
    externalUrl: `https://www.youtube.com/watch?v=${videoId}`,
    embedUrl: `https://www.youtube.com/embed/${videoId}`,
    durationMs: 0,
    explicit: false,
    popularity: 0,
    source: "youtube",
    reason: "Suggested from YouTube based on your selected mood",
  };
}

// Health check
app.get("/api/health", (_req, res) => {
  res.json({ ok: true, service: "TuneOn API" });
});

// Register endpoint
app.post("/api/auth/register", async (req, res) => {
  try {
    const { name, email, password, confirmPassword } = req.body;

    // Validation
    if (!name || !email || !password || !confirmPassword) {
      return res.status(400).json({ error: "All fields are required" });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({ error: "Passwords do not match" });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: "Password must be at least 6 characters" });
    }

    // Check if email exists
    const existingUser = getUserByEmail(email);
    if (existingUser) {
      return res.status(400).json({ error: "Email already registered" });
    }

    // Hash password and create user
    const hashedPassword = await hashPassword(password);
    const result = createUser(name, email, hashedPassword);

    if (!result.success) {
      return res.status(500).json({ error: result.message });
    }

    const token = generateToken(result.user.id, result.user.email);

    res.status(201).json({
      message: "Account created successfully",
      user: result.user,
      token,
    });
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({ error: "Registration failed" });
  }
});

// Login endpoint
app.post("/api/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    const user = getUserByEmail(email);
    if (!user) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    const isPasswordValid = await comparePasswords(password, user.passwordHash);
    if (!isPasswordValid) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    const token = generateToken(user.id, user.email);

    res.json({
      message: "Login successful",
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
      token,
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ error: "Login failed" });
  }
});

// Protected route example - get current user
app.get("/api/auth/me", authMiddleware, (req, res) => {
  res.json({
    user: req.user,
  });
});

// Get tracks (public)
app.get("/api/tracks", (_req, res) => {
  res.json({ tracks });
});

// Personalized recommendations (public demo)
app.get("/api/recommendations", (req, res) => {
  const { mood, genre, limit } = req.query;
  const recommendations = getRecommendations({ mood, genre, limit });

  res.json({
    selectedMood: mood || "focus",
    selectedGenre: genre || "any",
    recommendations,
  });
});

app.get("/api/spotify/recommendations", async (req, res) => {
  try {
    const mood = String(req.query.mood || "focus").toLowerCase();
    const genre = String(req.query.genre || "").trim();
    const limit = Math.max(1, Math.min(Number(req.query.limit) || 8, 20));

    const moodQuery = moodToSpotifyQuery(mood);
    const genreQuery = genre ? ` genre:${genre}` : "";
    const searchQuery = `${moodQuery}${genreQuery}`;

    const token = await getSpotifyAccessToken();
    const url = `https://api.spotify.com/v1/search?q=${encodeURIComponent(searchQuery)}&type=track&market=US&limit=${limit}`;
    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error?.message || "Spotify search failed");
    }

    const recommendations = (data.tracks?.items || []).map(toSpotifyTrack);

    res.json({
      source: "spotify",
      selectedMood: mood,
      selectedGenre: genre || "any",
      recommendations,
    });
  } catch (error) {
    res.status(500).json({
      error: error.message || "Could not fetch Spotify recommendations",
    });
  }
});

app.get("/api/youtube/recommendations", async (req, res) => {
  try {
    if (!youtubeApiKey) {
      return res.status(500).json({
        error: "YouTube API key is missing. Set YOUTUBE_API_KEY in backend/.env.",
      });
    }

    const mood = String(req.query.mood || "focus").toLowerCase();
    const genre = String(req.query.genre || "").trim();
    const limit = Math.max(1, Math.min(Number(req.query.limit) || 8, 20));

    const baseQuery = moodToYouTubeQuery(mood);
    const searchQuery = genre ? `${baseQuery} ${genre} music` : baseQuery;

    const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&type=video&videoEmbeddable=true&videoCategoryId=10&maxResults=${limit}&q=${encodeURIComponent(searchQuery)}&key=${youtubeApiKey}`;

    const response = await fetch(url);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error?.message || "YouTube search failed");
    }

    const recommendations = (data.items || []).map(toYouTubeTrack).filter(Boolean);

    res.json({
      source: "youtube",
      selectedMood: mood,
      selectedGenre: genre || "any",
      recommendations,
    });
  } catch (error) {
    res.status(500).json({
      error: error.message || "Could not fetch YouTube recommendations",
    });
  }
});

app.get("/api/youtube/search", async (req, res) => {
  try {
    if (!youtubeApiKey) {
      return res.status(500).json({
        error: "YouTube API key is missing. Set YOUTUBE_API_KEY in backend/.env.",
      });
    }

    const query = String(req.query.q || "").trim();
    const limit = Math.max(1, Math.min(Number(req.query.limit) || 10, 20));

    if (!query) {
      return res.status(400).json({ error: "Query parameter q is required" });
    }

    const searchQuery = `${query} audio`;
    const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&type=video&videoEmbeddable=true&videoCategoryId=10&maxResults=${limit}&q=${encodeURIComponent(searchQuery)}&key=${youtubeApiKey}`;

    const response = await fetch(url);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error?.message || "YouTube search failed");
    }

    const results = (data.items || []).map(toYouTubeTrack).filter(Boolean);

    res.json({
      source: "youtube",
      query,
      results,
    });
  } catch (error) {
    res.status(500).json({
      error: error.message || "Could not search YouTube songs",
    });
  }
});

// Get protected user playlists (example)
app.get("/api/playlists", authMiddleware, (req, res) => {
  res.json({
    message: "User playlists",
    userId: req.user.id,
    playlists: [],
  });
});

app.listen(port, () => {
  console.log(`TuneOn API running at http://localhost:${port}`);
  console.log("Test credentials:");
  console.log("  Email: alex@tuneon.com");
  console.log("  Password: password123");
});
