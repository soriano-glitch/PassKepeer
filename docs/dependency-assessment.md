# Dependency assessment (Phase 1, candidate — PoC must verify)

Registry versions below were read on 2026-10-11. Registry presence is not compatibility proof.
Resolved install on 2026-10-11 (Windows, npm install exit 0): expo 57.0.27, expo-router 57.0.25,
react-native 0.86.3, react 19.2.3, @testing-library/react-native 14.1.0, react-native-libsodium 1.7.0.

Fixes applied: react 19.1.0 -> 19.2.3 (SDK 57 expects RN 0.86.3 + react 19.2.3; registry-latest
RN 0.87.1 breaks jest-expo 57 which still requires @react-native/assets-registry);
@testing-library/react-native ^12.4.0 -> ^14.1.0 (expo-router 57.0.25 needs >=13.2.0).
Accepted deviation: typescript 5.9.3 vs expo-expected ~6.0.3 (typecheck passes; Jest uses Babel).

Verification (Windows, 2026-10-11): npm install exit 0; npm run typecheck passes;
npx jest tests/unit tests/security --runInBand: 2 suites, 6 tests pass.
npx expo prebuild --clean succeeds (generates android/; ios/ requires macOS).
jest.config.js maps ESM `.js` suffix imports back to `.ts` for the Babel resolver.

| Area | Candidate | Version | Must verify in PoC |
|------|-----------|---------|--------------------|
| Framework | expo (SDK 57 line) | 57.x | Exact SDK <-> RN pairing from create-expo-app |
| Navigation | expo-router | 57.0.25 | Matches SDK |
| Dev builds | expo-dev-client | 57.0.19 | Builds on both platforms |
| Biometrics prompt | expo-local-authentication | 57.0.3 | Prompt only, does not gate keys |
| Key storage | expo-secure-store | 57.0.4 | requireAuthentication, invalidation, Keystore backing, backup flags |
| Encrypted SQLite A | expo-sqlite with SQLCipher config | 57.0.4 | Confirm SQLCipher option in official docs; file unreadable without key |
| Encrypted SQLite B | @op-engineering/op-sqlite | 18.2.5 | Fallback; New Architecture support |
| Crypto AEAD + Argon2id | react-native-libsodium | 1.7.0 | crypto_pwhash, XChaCha20-Poly1305, KDF, both platforms |
| Crypto alt | react-native-quick-crypto | 1.1.8 | Fallback |
| Secure random | libsodium randombytes_buf or expo-crypto | 57.0.3 | Never Math.random |
| Clipboard | expo-clipboard | 57.0.2 | Clearing differs on Android 13+ / iOS |
| Screen protection | expo-screen-capture | 57.0.4 | FLAG_SECURE; iOS overlay needed |

## Unresolved

1. Which SQLCipher route works with the installed SDK/RN version.
2. Whether libsodium bindings support the New Architecture on that RN version.
3. Biometric-gated key invalidation on enrollment change.
4. Android auto-backup and iOS backup exclusion for DB, key blobs, backups.
