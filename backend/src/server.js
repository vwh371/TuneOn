import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { getUserByEmail, createUser } from "./db.js";
import { hashPassword, comparePasswords, generateToken, authMiddleware } from "./auth.js";

dotenv.config();

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const tracks = [
  { id: 1, title: "City Lights", artist: "Nova Street", genre: "Synthwave" },
  { id: 2, title: "Paper Boats", artist: "Aria Coast", genre: "Indie Pop" },
  { id: 3, title: "Drift Theory", artist: "Mono Pulse", genre: "Electronic" },
  { id: 4, title: "Quiet Riot", artist: "Hollow Frames", genre: "Alt Rock" }
];

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
