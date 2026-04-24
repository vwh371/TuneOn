import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dbPath = path.join(__dirname, "../data/users.json");

// Ensure data directory exists
const dataDir = path.dirname(dbPath);
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

// Initialize database with test users
function initializeDb() {
  if (!fs.existsSync(dbPath)) {
    const initialData = {
      users: [
        {
          id: "1",
          name: "Alex Johnson",
          email: "alex@tuneon.com",
          passwordHash: "$2a$10$N9qo8uLOickgx2ZMRZoXe.FKLv2DV6rXmEAI0H4.xBF5BYqPx4F8K", // bcrypt hash of "password123"
          createdAt: new Date().toISOString(),
        },
      ],
    };
    fs.writeFileSync(dbPath, JSON.stringify(initialData, null, 2));
    console.log("Database initialized with test user (alex@tuneon.com / password123)");
  }
}

// Read database
function readDb() {
  try {
    const data = fs.readFileSync(dbPath, "utf-8");
    return JSON.parse(data);
  } catch (err) {
    console.error("Error reading database:", err);
    return { users: [] };
  }
}

// Write database
function writeDb(data) {
  try {
    fs.writeFileSync(dbPath, JSON.stringify(data, null, 2));
    return true;
  } catch (err) {
    console.error("Error writing database:", err);
    return false;
  }
}

function normalizeEmail(email) {
  return String(email || "").trim().toLowerCase();
}

// Get user by email
export function getUserByEmail(email) {
  const db = readDb();
  const normalizedEmail = normalizeEmail(email);
  return db.users.find((user) => normalizeEmail(user.email) === normalizedEmail);
}

// Get user by ID
export function getUserById(id) {
  const db = readDb();
  return db.users.find((user) => user.id === id);
}

export function getUserByAppleId(appleId) {
  const db = readDb();
  return db.users.find((user) => user.appleId === appleId);
}

export function getUserByEmailOrGoogleId(identifier) {
  const db = readDb();
  const normalized = normalizeEmail(identifier);

  return db.users.find(
    (user) => normalizeEmail(user.email) === normalized || String(user.googleId || "") === String(identifier || ""),
  );
}

// Create user
export function createUser(name, email, passwordHash, metadata = {}) {
  const db = readDb();
  const normalizedEmail = normalizeEmail(email);

  if (db.users.some((user) => normalizeEmail(user.email) === normalizedEmail)) {
    return { success: false, message: "Email already registered" };
  }

  const newUser = {
    id: String(Date.now()),
    name,
    email: normalizedEmail,
    passwordHash,
    ...metadata,
    createdAt: new Date().toISOString(),
  };

  db.users.push(newUser);

  if (writeDb(db)) {
    return { success: true, user: { id: newUser.id, name: newUser.name, email: newUser.email } };
  }

  return { success: false, message: "Failed to create user" };
}

export function upsertGoogleUser({ name, email, googleId, avatarUrl }) {
  const db = readDb();
  const normalizedEmail = normalizeEmail(email);

  const existingIndex = db.users.findIndex(
    (user) => normalizeEmail(user.email) === normalizedEmail || user.googleId === googleId,
  );

  if (existingIndex >= 0) {
    const existingUser = db.users[existingIndex];
    const updatedUser = {
      ...existingUser,
      name: existingUser.name || name,
      email: normalizeEmail(existingUser.email || normalizedEmail),
      googleId,
      authProvider: "google",
      avatarUrl: avatarUrl || existingUser.avatarUrl || "",
      updatedAt: new Date().toISOString(),
    };

    db.users[existingIndex] = updatedUser;

    if (writeDb(db)) {
      return {
        success: true,
        user: {
          id: updatedUser.id,
          name: updatedUser.name,
          email: updatedUser.email,
          googleId: updatedUser.googleId,
          avatarUrl: updatedUser.avatarUrl || "",
          authProvider: updatedUser.authProvider,
        },
      };
    }

    return { success: false, message: "Failed to update user" };
  }

  const newUser = {
    id: String(Date.now()),
    name,
    email: normalizedEmail,
    passwordHash: null,
    googleId,
    authProvider: "google",
    avatarUrl: avatarUrl || "",
    createdAt: new Date().toISOString(),
  };

  db.users.push(newUser);

  if (writeDb(db)) {
    return {
      success: true,
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        googleId: newUser.googleId,
        avatarUrl: newUser.avatarUrl,
        authProvider: newUser.authProvider,
      },
    };
  }

  return { success: false, message: "Failed to create Google user" };
}

export function upsertAppleUser({ name, email, appleId }) {
  const db = readDb();
  const normalizedEmail = email ? normalizeEmail(email) : "";

  const existingIndex = db.users.findIndex(
    (user) => user.appleId === appleId || (normalizedEmail && normalizeEmail(user.email) === normalizedEmail),
  );

  if (existingIndex >= 0) {
    const existingUser = db.users[existingIndex];
    const updatedUser = {
      ...existingUser,
      name: existingUser.name || name || "Apple User",
      email: normalizeEmail(existingUser.email || normalizedEmail || ""),
      appleId,
      authProvider: "apple",
      updatedAt: new Date().toISOString(),
    };

    db.users[existingIndex] = updatedUser;

    if (writeDb(db)) {
      return {
        success: true,
        user: {
          id: updatedUser.id,
          name: updatedUser.name,
          email: updatedUser.email,
          authProvider: updatedUser.authProvider,
        },
      };
    }

    return { success: false, message: "Failed to update user" };
  }

  const newUser = {
    id: String(Date.now()),
    name: name || "Apple User",
    email: normalizedEmail,
    passwordHash: null,
    appleId,
    authProvider: "apple",
    createdAt: new Date().toISOString(),
  };

  db.users.push(newUser);

  if (writeDb(db)) {
    return {
      success: true,
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        authProvider: newUser.authProvider,
      },
    };
  }

  return { success: false, message: "Failed to create Apple user" };
}

export function savePasswordResetToken(userId, tokenHash, expiresAt) {
  const db = readDb();
  const userIndex = db.users.findIndex((user) => user.id === userId);

  if (userIndex < 0) {
    return { success: false, message: "User not found" };
  }

  db.users[userIndex] = {
    ...db.users[userIndex],
    resetPasswordTokenHash: tokenHash,
    resetPasswordExpiresAt: expiresAt,
    updatedAt: new Date().toISOString(),
  };

  if (writeDb(db)) {
    return { success: true };
  }

  return { success: false, message: "Failed to save reset token" };
}

export function getUserByPasswordResetTokenHash(tokenHash) {
  const db = readDb();
  const now = Date.now();

  return db.users.find((user) => {
    if (!user.resetPasswordTokenHash || !user.resetPasswordExpiresAt) {
      return false;
    }

    return user.resetPasswordTokenHash === tokenHash && new Date(user.resetPasswordExpiresAt).getTime() > now;
  });
}

export function updateUserPassword(userId, passwordHash) {
  const db = readDb();
  const userIndex = db.users.findIndex((user) => user.id === userId);

  if (userIndex < 0) {
    return { success: false, message: "User not found" };
  }

  db.users[userIndex] = {
    ...db.users[userIndex],
    passwordHash,
    authProvider: "local",
    resetPasswordTokenHash: null,
    resetPasswordExpiresAt: null,
    updatedAt: new Date().toISOString(),
  };

  if (writeDb(db)) {
    return { success: true };
  }

  return { success: false, message: "Failed to update password" };
}

export function updateUserPreferences(userId, { genres, artist, language }) {
  const db = readDb();
  const userIndex = db.users.findIndex((user) => user.id === userId);

  if (userIndex < 0) {
    return { success: false, message: "User not found" };
  }

  db.users[userIndex] = {
    ...db.users[userIndex],
    preferences: {
      genres,
      artist,
      language,
    },
    updatedAt: new Date().toISOString(),
  };

  if (writeDb(db)) {
    return { success: true };
  }

  return { success: false, message: "Failed to update preferences" };
}

// Initialize on import
initializeDb();
