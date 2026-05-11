import Database from 'better-sqlite3';
import path from 'path';

const DB_PATH = path.join(process.cwd(), 'data', 'saodo.db');

let db: Database.Database | null = null;

export function getDb(): Database.Database {
  if (!db) {
    const fs = require('fs');
    const dir = path.dirname(DB_PATH);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    db = new Database(DB_PATH);
    db.pragma('journal_mode = WAL');
    db.pragma('foreign_keys = ON');

    db.exec(`
      CREATE TABLE IF NOT EXISTS students (
        id TEXT PRIMARY KEY,
        student_id TEXT UNIQUE NOT NULL,
        full_name TEXT NOT NULL,
        email TEXT,
        phone TEXT,
        date_of_birth TEXT,
        faculty TEXT,
        major TEXT,
        course TEXT,
        gpa REAL,
        status TEXT DEFAULT 'active',
        created_at TEXT DEFAULT (datetime('now')),
        updated_at TEXT DEFAULT (datetime('now'))
      );

      CREATE TABLE IF NOT EXISTS demo_records (
        id TEXT PRIMARY KEY,
        student_id TEXT NOT NULL,
        title TEXT NOT NULL,
        description TEXT,
        demo_date TEXT,
        score REAL,
        evaluator TEXT,
        notes TEXT,
        created_at TEXT DEFAULT (datetime('now')),
        FOREIGN KEY (student_id) REFERENCES students(id)
      );

      CREATE TABLE IF NOT EXISTS auth_users (
        id TEXT PRIMARY KEY,
        student_id TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        email TEXT,
        reset_token TEXT,
        reset_token_expiry TEXT,
        created_at TEXT DEFAULT (datetime('now'))
      );
    `);
  }

  return db;
}

export function closeDb(): void {
  if (db) {
    db.close();
    db = null;
  }
}
