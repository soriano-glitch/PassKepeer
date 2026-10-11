-- PassKeeper 001: vault metadata + credential entries (field ciphertext opaque blobs).
-- Application-layer encrypted columns hold nonce||ciphertext||tag; plaintext never lands here.
CREATE TABLE IF NOT EXISTS vault_meta (
  id INTEGER PRIMARY KEY CHECK (id = 1),
  kdf_mem_kib INTEGER NOT NULL,
  kdf_iterations INTEGER NOT NULL,
  kdf_parallelism INTEGER NOT NULL,
  kdf_salt BLOB NOT NULL,
  wrapped_vdk BLOB NOT NULL,
  params_version INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS categories (
  id TEXT PRIMARY KEY,
  name_cipher BLOB NOT NULL,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS entries (
  id TEXT PRIMARY KEY,
  title_cipher BLOB NOT NULL,
  username_cipher BLOB NOT NULL,
  password_cipher BLOB NOT NULL,
  url_cipher BLOB NOT NULL,
  notes_cipher BLOB NOT NULL,
  category_id TEXT REFERENCES categories(id) ON DELETE SET NULL,
  is_favorite INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS backup_meta (
  id INTEGER PRIMARY KEY CHECK (id = 1),
  last_backup_at TEXT,
  backup_format_version INTEGER NOT NULL DEFAULT 1
);
