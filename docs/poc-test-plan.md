# PoC test plan (reproducible, Android + iOS, fake data only)

Run on: Android emulator and one physical Android device; iOS simulator and one physical iPhone.

| ID | Test | Pass condition |
|----|------|----------------|
| PoC-1 | Argon2id derive twice, same password+salt | Identical keys; different salt gives different key |
| PoC-2 | Derivation time on lowest-end device | Within target (e.g. <= ~1s), not memory-killed |
| PoC-3 | AEAD round trip | Decrypts to original plaintext |
| PoC-4 | Wrong key | Decrypt throws, no partial plaintext |
| PoC-5 | Flip one byte in ciphertext/tag/nonce/AAD | Decrypt throws |
| PoC-6 | Nonce uniqueness (10k encryptions) | No repeats |
| PoC-7 | Wrap/unwrap VDK with KEK | Round trip ok; wrong KEK fails |
| PoC-8 | Encrypted SQLite write, kill, relaunch, read | Data persists with correct key |
| PoC-9 | Open DB file with no/wrong key; strings check | Fails; no plaintext visible |
| PoC-10 | Keystore/Keychain blob survives app + device restart | Retrievable only after biometric when enabled |
| PoC-11 | Biometric cancel/lockout/unavailable | Falls back to master password, no key release |
| PoC-12 | Enroll new biometric | Bound key invalidates; password path works |
| PoC-13 | Export backup, delete app, restore fresh install | Restores; wrong password/tamper rejected |
| PoC-14 | Logger redaction | No secrets in logcat / Xcode console |
| PoC-15 | Android backup simulation | DB and key blobs excluded |

Exit criterion: PoC-1 to PoC-15 pass on both platforms, or each failure records a chosen alternative.
