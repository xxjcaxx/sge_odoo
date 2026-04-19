import Database from 'better-sqlite3'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const DB_PATH   = join(__dirname, '..', 'data', 'progress.db')

let db

export function getDb() {
  if (db) return db

  // Ensure data/ directory exists
  import('fs').then(({ mkdirSync }) => mkdirSync(join(__dirname, '..', 'data'), { recursive: true }))

  db = new Database(DB_PATH)
  db.pragma('journal_mode = WAL')

  db.exec(`
    CREATE TABLE IF NOT EXISTS students (
      nia        TEXT    PRIMARY KEY,
      name       TEXT    NOT NULL DEFAULT '',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS progress (
      id          INTEGER PRIMARY KEY AUTOINCREMENT,
      nia         TEXT    NOT NULL,
      slug        TEXT    NOT NULL,
      results     TEXT    NOT NULL,  -- JSON array
      score       TEXT,
      ok_count    INTEGER DEFAULT 0,
      warn_count  INTEGER DEFAULT 0,
      fail_count  INTEGER DEFAULT 0,
      total_count INTEGER DEFAULT 0,
      form_values TEXT    DEFAULT '{}',  -- JSON object with form fields
      updated_at  DATETIME DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(nia, slug),
      FOREIGN KEY (nia) REFERENCES students(nia)
    );

    CREATE TABLE IF NOT EXISTS activities (
      id          INTEGER PRIMARY KEY AUTOINCREMENT,
      title       TEXT    NOT NULL,
      description TEXT    NOT NULL DEFAULT '',
      is_visible  INTEGER NOT NULL DEFAULT 1,
      created_at  DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at  DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS practice_visibility (
      slug        TEXT PRIMARY KEY,
      is_visible  INTEGER NOT NULL DEFAULT 1,
      updated_at  DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `)

  // Migration: add form_values column if it doesn't exist yet (for existing DBs)
  const cols = db.prepare(`PRAGMA table_info(progress)`).all()
  if (!cols.some((c) => c.name === 'form_values')) {
    db.exec(`ALTER TABLE progress ADD COLUMN form_values TEXT DEFAULT '{}'`)
  }

  return db
}
