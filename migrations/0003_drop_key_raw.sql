-- Remove plaintext API key storage (security fix)
-- D1 doesn't support DROP COLUMN directly, so we recreate the table

CREATE TABLE api_keys_new (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  key_hash TEXT NOT NULL,
  label TEXT,
  last_used_at TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

INSERT INTO api_keys_new (id, user_id, key_hash, label, last_used_at, created_at)
  SELECT id, user_id, key_hash, label, last_used_at, created_at FROM api_keys;

DROP TABLE api_keys;
ALTER TABLE api_keys_new RENAME TO api_keys;

CREATE INDEX idx_api_keys_user_id ON api_keys(user_id);
CREATE INDEX idx_api_keys_key_hash ON api_keys(key_hash);
