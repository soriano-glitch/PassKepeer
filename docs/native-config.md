# Native configuration (Phase 1 checklist)

- Use a development build (`expo-dev-client`, `expo prebuild`). Expo Go is unsupported.
- SQLCipher: enable via the chosen SQLite package config plugin or build flag. Verify PoC-9.
- Android: confirm minSdkVersion for Keystore + biometric APIs; set `allowBackup=false`
  (or extraction rules); add `USE_BIOMETRIC`; apply `FLAG_SECURE` on sensitive screens
  at runtime via the `expo-screen-capture` API (`preventScreenCaptureAsync`).
  `expo-screen-capture` ships no config plugin, so it must not appear in `app.json` plugins.
- iOS: set `NSFaceIDUsageDescription`; use `ThisDeviceOnly` Keychain accessibility;
  set `isExcludedFromBackup` on DB and backup files; add app-switcher blur on inactive.
- Disable crash and analytics SDKs. Confirm no extra network permission.
- Record exact built versions in `docs/dependency-assessment.md` after each successful build.

See `app.json` for the Phase 1 baseline.
