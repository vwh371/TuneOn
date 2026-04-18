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

## Available Scripts

At root:
- npm run dev starts frontend + backend
- npm run build builds frontend
- npm run start starts backend in production mode
