# Threat model (Phase 1 draft)

## Assets

Master password (memorized), VDK, KEK, biometric-wrapped VDK copy, credential fields, backup files.

## Threats

- Device theft: attacker holds locked device. Defense: Argon2id KEK, encrypted DB, biometric-gated key,
  auto-lock, no plaintext fallback.
- Offline DB extraction: attacker pulls DB file. Defense: SQLCipher file key plus field-level AEAD;
  verify with strings check (PoC-9).
- Incorrect master password: attacker guesses. Defense: Argon2id cost, escalating delay, no hint oracle.
  Legitimate loss means permanent data loss without a valid backup.
- Compromised or rooted device: out of scope for full defense. Document limits, detect where feasible,
  minimize memory lifetime of keys.
- Backup exposure: backup file leaks. Defense: independent salt + recovery password, AEAD, versioned header.
- Accidental leakage: logs, clipboard, app switcher, screenshots, device backups, crash reports. Defense:
  redacting logger, clipboard clear, FLAG_SECURE, iOS blur overlay, backup exclusion, no analytics SDK.

## Non-goals

Cloud sync, breach-check uploads, rooted-device victory. No passwords leave the device in v1.
