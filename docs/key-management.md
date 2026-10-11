# Key management (proposed, pending PoC)

Master password is memorized and never stored. Argon2id with a random salt derives the KEK.
The KEK AEAD-unwraps the VDK (random 256-bit, generated once at setup).

- Field key = HKDF(VDK, "fields"); DB key = HKDF(VDK, "db").
- Master password change re-wraps the VDK only. No mass re-encryption.
- Biometric path stores a device-bound wrapped copy of the VDK behind Keychain/Keystore
  access control. Enrollment change invalidates it; master password still works.
- Argon2id params are chosen by measurement on a low-end physical device against current
  OWASP guidance and stored per vault for upgrades.
- Forgotten master password plus no valid backup means permanent data loss. The UI states this.
