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
```

The JWT_SECRET defaults to "your-secret-key-change-in-production" if not provided.
