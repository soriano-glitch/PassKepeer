# Backup and recovery (proposed, pending PoC)

- Separate file, own random salt, own Argon2id key from a user-chosen recovery password.
- AEAD payload plus versioned header (formatVersion, KDF params, salt).
- Auth required before export and restore. Validate format, integrity, version first.
- Never overwrite an existing vault without confirmation. Restore is transactional.
- Wrong recovery password and tampered files fail cleanly with no partial import.
- Recovery password is never stored in plaintext. Losing it plus losing the master
  password means permanent data loss.
