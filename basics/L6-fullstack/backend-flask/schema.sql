-- Table definition. Runs on startup; IF NOT EXISTS makes it safe to run every time.
-- SQLite has no real boolean type, so we store 0/1 in an INTEGER.
CREATE TABLE IF NOT EXISTS items (
    id     INTEGER PRIMARY KEY AUTOINCREMENT,
    name   TEXT    NOT NULL,
    bought INTEGER NOT NULL DEFAULT 0
);
