/**
 * Authenticated encryption interface for Phase 1.
 * Production implementations must use a vetted AEAD (for example
 * XChaCha20-Poly1305 from libsodium). This file declares the contract only.
 * Wire format: nonce || ciphertext || tag (exact split is library-defined).
 */
export interface Aead {
  encrypt(key: Uint8Array, plaintext: Uint8Array, aad?: Uint8Array): Promise<Uint8Array>;
  decrypt(key: Uint8Array, blob: Uint8Array, aad?: Uint8Array): Promise<Uint8Array>;
}

export class EncryptionUnavailableError extends Error {
  constructor(message = 'Encryption backend unavailable; refusing plaintext fallback.') {
    super(message);
    this.name = 'EncryptionUnavailableError';
  }
}
