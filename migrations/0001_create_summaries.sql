CREATE TABLE IF NOT EXISTS summaries (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  topic_name  TEXT    NOT NULL,
  summary     TEXT    NOT NULL,
  created_at  INTEGER NOT NULL,
  notified_at INTEGER
);
