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

// Get user by email
export function getUserByEmail(email) {
  const db = readDb();
  return db.users.find((user) => user.email === email);
}

// Get user by ID
export function getUserById(id) {
  const db = readDb();
  return db.users.find((user) => user.id === id);
}

// Create user
export function createUser(name, email, passwordHash) {
  const db = readDb();

  if (db.users.some((user) => user.email === email)) {
    return { success: false, message: "Email already registered" };
  }

  const newUser = {
    id: String(Date.now()),
    name,
    email,
    passwordHash,
    createdAt: new Date().toISOString(),
  };

  db.users.push(newUser);

  if (writeDb(db)) {
    return { success: true, user: { id: newUser.id, name: newUser.name, email: newUser.email } };
  }

  return { success: false, message: "Failed to create user" };
}

// Initialize on import
initializeDb();
