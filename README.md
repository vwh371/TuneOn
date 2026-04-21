# TuneOn

A full-stack music player starter project with:
- Frontend: React (Vite)
- Backend: Node.js + Express

## Project Structure

- frontend/ React app
- backend/ Express API
- root package.json to run both apps together

## Quick Start

1. Install root dependency (for running both servers in one command):
   ```bash
   npm install
   ```
2. Install frontend dependencies:
   ```bash
   npm install --prefix frontend
   ```
3. Install backend dependencies:
   ```bash
   npm install --prefix backend
   ```
4. Start both frontend and backend:
   ```bash
   npm run dev
   ```

## Default URLs

- Frontend: http://localhost:5173
- Backend: http://localhost:5000
- Health route: http://localhost:5000/api/health
- Tracks route: http://localhost:5000/api/tracks
- YouTube recommendations: http://localhost:5000/api/youtube/recommendations?mood=focus&limit=8
- Spotify recommendations: http://localhost:5000/api/spotify/recommendations?mood=focus&limit=8

## Backend Environment Variables

Create `backend/.env` and set:

```bash
PORT=5000
JWT_SECRET=your-secret-key-change-in-production
YOUTUBE_API_KEY=your-youtube-data-api-v3-key
SPOTIFY_CLIENT_ID=your-spotify-client-id
SPOTIFY_CLIENT_SECRET=your-spotify-client-secret
```

Notes:
- `YOUTUBE_API_KEY` enables YouTube-powered recommendations.
- Spotify variables enable Spotify-powered recommendations.
- Home recommendations now try YouTube first, then Spotify, then TuneOn local fallback.

## Available Scripts

At root:
- npm run dev starts frontend + backend
- npm run build builds frontend
- npm run start starts backend in production mode
