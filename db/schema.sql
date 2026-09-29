-- D1 schema for portfolio-db. Apply with:
--   npx wrangler d1 execute portfolio-db --remote --file db/schema.sql
CREATE TABLE IF NOT EXISTS scores (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  score INTEGER NOT NULL,
  created INTEGER NOT NULL,
  who TEXT NOT NULL,
  game TEXT NOT NULL DEFAULT 'stack'
);
CREATE INDEX IF NOT EXISTS scores_rank ON scores (score DESC, created ASC);
CREATE INDEX IF NOT EXISTS scores_game_rank ON scores (game, score DESC, created ASC);

CREATE TABLE IF NOT EXISTS counters (key TEXT PRIMARY KEY, value INTEGER NOT NULL DEFAULT 0);
INSERT OR IGNORE INTO counters (key, value) VALUES ('sparks', 0);

-- Recent actions per visitor, for rate limiting. Rows older than a day are pruned.
CREATE TABLE IF NOT EXISTS hits (who TEXT NOT NULL, action TEXT NOT NULL, ts INTEGER NOT NULL);
CREATE INDEX IF NOT EXISTS hits_lookup ON hits (who, action, ts);

-- Guestbook entries wait for approval (approved = 1) before they are shown.
CREATE TABLE IF NOT EXISTS guestbook (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL, message TEXT NOT NULL DEFAULT '', drawing TEXT NOT NULL, created INTEGER NOT NULL, who TEXT NOT NULL, approved INTEGER NOT NULL DEFAULT 0);
CREATE INDEX IF NOT EXISTS guestbook_wall ON guestbook (approved, created DESC);

-- Would You Rather: head-to-head counts per pair (a < b) and an Elo rating per game.
CREATE TABLE IF NOT EXISTS wyr_pairs (a TEXT NOT NULL, b TEXT NOT NULL, a_votes INTEGER NOT NULL DEFAULT 0, b_votes INTEGER NOT NULL DEFAULT 0, PRIMARY KEY (a, b));
CREATE TABLE IF NOT EXISTS wyr_elo (game TEXT PRIMARY KEY, rating REAL NOT NULL DEFAULT 1000, wins INTEGER NOT NULL DEFAULT 0, losses INTEGER NOT NULL DEFAULT 0);
CREATE INDEX IF NOT EXISTS wyr_elo_rank ON wyr_elo (rating DESC);
