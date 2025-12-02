import Database from 'better-sqlite3';
import path from 'path';

const dbPath = path.join(process.cwd(), 'ctf.db');
const db = new Database(dbPath);

// Initialize Database Schema
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    username TEXT PRIMARY KEY,
    score INTEGER DEFAULT 0,
    badges TEXT DEFAULT '[]',
    solved_challenges TEXT DEFAULT '[]'
  );

  CREATE TABLE IF NOT EXISTS challenges (
    id TEXT PRIMARY KEY,
    data TEXT
  );
`);

export default db;
