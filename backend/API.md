# TuneOn Backend API

## Setup

The backend uses:
- **bcryptjs** for password hashing
- **jsonwebtoken** for JWT authentication
- **File-based database** stored in `data/users.json` for testing

## Test User

The system initializes with a test user:
- **Email:** alex@tuneon.com
- **Password:** password123

## API Endpoints

### Public Endpoints

#### Health Check
```
GET /api/health
```
Response:
```json
{
  "ok": true,
  "service": "TuneOn API"
}
```

#### Get Tracks
```
GET /api/tracks
```
Response:
```json
{
  "tracks": [
    { "id": 1, "title": "City Lights", "artist": "Nova Street", "genre": "Synthwave" },
    ...
  ]
}
```

#### YouTube Recommendations
```
GET /api/youtube/recommendations?mood=focus&genre=lofi&limit=8
```
Response:
```json
{
  "source": "youtube",
  "selectedMood": "focus",
  "selectedGenre": "lofi",
  "recommendations": [
    {
      "id": "yt_xxxxx",
      "title": "Lofi Mix",
      "artist": "Channel Name",
      "genre": "YouTube Music",
      "cover": "https://...",
      "externalUrl": "https://www.youtube.com/watch?v=xxxxx",
      "embedUrl": "https://www.youtube.com/embed/xxxxx"
    }
  ]
}
```

#### YouTube Song Search
```
GET /api/youtube/search?q=blinding+lights&limit=8
```
Response:
```json
{
  "source": "youtube",
  "query": "blinding lights",
  "results": [
    {
      "id": "yt_xxxxx",
      "title": "The Weeknd - Blinding Lights",
      "artist": "The Weeknd",
      "genre": "YouTube Music",
      "cover": "https://...",
      "externalUrl": "https://www.youtube.com/watch?v=xxxxx",
      "embedUrl": "https://www.youtube.com/embed/xxxxx"
    }
  ]
}
```

#### Spotify Recommendations
```
GET /api/spotify/recommendations?mood=focus&genre=lofi&limit=8
```
Response:
```json
{
  "source": "spotify",
  "selectedMood": "focus",
  "selectedGenre": "lofi",
  "recommendations": [
    {
      "id": "spotify-track-id",
      "title": "Track Name",
      "artist": "Artist",
      "genre": "Spotify",
      "cover": "https://...",
      "externalUrl": "https://open.spotify.com/track/...",
      "embedUrl": "https://open.spotify.com/embed/track/..."
    }
  ]
}
```

### Authentication Endpoints

#### Register
```
POST /api/auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@tuneon.com",
  "password": "password123",
  "confirmPassword": "password123"
}
```
Response (201):
```json
{
  "message": "Account created successfully",
  "user": {
    "id": "1234567890",
    "name": "John Doe",
    "email": "john@tuneon.com"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

#### Login
```
POST /api/auth/login
Content-Type: application/json

{
  "email": "alex@tuneon.com",
  "password": "password123"
}
```

#### Google Login
```
POST /api/auth/google
Content-Type: application/json

{
  "credential": "google-id-token-from-gis"
}
```

#### Google Login (Access Token)
```
POST /api/auth/google/token
Content-Type: application/json

{
  "accessToken": "google-oauth-access-token"
}
```

#### Forgot Password
```
POST /api/auth/forgot-password
Content-Type: application/json

{
  "emailOrId": "name@gmail.com or google-id"
}
```
Response:
```json
{
  "message": "If an account exists, a reset email has been sent."
}
```

#### Reset Password
```
POST /api/auth/reset-password
Content-Type: application/json

{
  "token": "token-from-email-link",
  "password": "newpassword123",
  "confirmPassword": "newpassword123"
}
```

#### Apple Login
```
POST /api/auth/apple
Content-Type: application/json

{
  "identityToken": "apple-id-token",
  "user": {
    "email": "optional-first-login-email",
    "name": {
      "firstName": "John",
      "lastName": "Doe"
    }
  }
}
```
Response:
```json
{
  "message": "Apple login successful",
  "user": {
    "id": "1234567890",
    "name": "John Doe",
    "email": "john@privaterelay.appleid.com",
    "authProvider": "apple"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```
Response:
```json
{
  "message": "Google login successful",
  "user": {
    "id": "1234567890",
    "name": "John Doe",
    "email": "john@gmail.com",
    "avatarUrl": "https://...",
    "authProvider": "google"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```
Response:
```json
{
  "message": "Login successful",
  "user": {
    "id": "1",
    "name": "Alex Johnson",
    "email": "alex@tuneon.com"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### Protected Endpoints

All protected endpoints require the JWT token in the Authorization header:
```
Authorization: Bearer <token>
```

#### Get Current User
```
GET /api/auth/me
Authorization: Bearer <token>
```
Response:
```json
{
  "user": {
    "id": "1",
    "email": "alex@tuneon.com"
  }
}
```

#### Get User Playlists
```
GET /api/playlists
Authorization: Bearer <token>
```
Response:
```json
{
  "message": "User playlists",
  "userId": "1",
  "playlists": []
}
```

## Database

The user database is stored in `data/users.json`:
```json
{
  "users": [
    {
      "id": "1",
      "name": "Alex Johnson",
      "email": "alex@tuneon.com",
      "passwordHash": "<bcrypt hash>",
      "authProvider": "local",
      "googleId": "optional-google-sub",
      "avatarUrl": "optional-image-url",
      "createdAt": "2024-04-17T10:00:00.000Z"
    }
  ]
}
```

## Running the Backend

Development mode:
```bash
npm run dev
```

Production mode:
```bash
npm start
```

The API runs on `http://localhost:5000` by default.

## Environment Variables

Create a `.env` file (optional):
```
PORT=5000
JWT_SECRET=your-secret-key-change-in-production
YOUTUBE_API_KEY=your-youtube-data-api-v3-key
SPOTIFY_CLIENT_ID=your-spotify-client-id
SPOTIFY_CLIENT_SECRET=your-spotify-client-secret
GOOGLE_CLIENT_ID=your-google-oauth-client-id
APPLE_CLIENT_ID=your-apple-service-id
FRONTEND_BASE_URL=http://localhost:5173
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
EMAIL_FROM=TuneOn <your-email@gmail.com>
```

The JWT_SECRET defaults to "your-secret-key-change-in-production" if not provided.
