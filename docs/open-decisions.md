# Unresolved security decisions (Phase 1 exit requires each to close)

1. SQLCipher route: expo-sqlite vs op-sqlite.
2. DB-level plus field-level encryption, or field-level only (recommended: both).
3. Argon2id params by measurement; store params per vault (recommended: yes).
4. Biometric invalidation on enrollment change (recommended: invalidate).
5. Failed-unlock policy: escalating delay only, no auto-wipe by default.
6. Backup recovery password separate from master password (recommended: separate).
7. Auto-lock and clipboard timeout defaults.
8. Plaintext metadata scope: encrypt title/URL/username/notes (recommended: encrypt them).
9. Minimum OS versions.
10. Ship screenshot blocking on Android by default (recommended: yes).
