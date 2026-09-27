-- D1 schema for portfolio-db. Apply with:
--   npx wrangler d1 execute portfolio-db --remote --file db/schema.sql
CREATE TABLE IF NOT EXISTS scores (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  score INTEGER NOT NULL,
  created INTEGER NOT NULL,
  who TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS scores_rank ON scores (score DESC, created ASC);

CREATE TABLE IF NOT EXISTS counters (key TEXT PRIMARY KEY, value INTEGER NOT NULL DEFAULT 0);
INSERT OR IGNORE INTO counters (key, value) VALUES ('sparks', 0);

-- Recent actions per visitor, for rate limiting. Rows older than a day are pruned.
CREATE TABLE IF NOT EXISTS hits (who TEXT NOT NULL, action TEXT NOT NULL, ts INTEGER NOT NULL);
CREATE INDEX IF NOT EXISTS hits_lookup ON hits (who, action, ts);
