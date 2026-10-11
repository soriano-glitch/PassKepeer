/**
 * Randomness contract. Production must use libsodium randombytes_buf or
 * expo-crypto. Never Math.random().
 */
export interface SecureRandom {
  bytes(length: number): Promise<Uint8Array>;
}

export function assertRandomLength(length: number): void {
  if (!Number.isInteger(length) || length <= 0 || length > 1024) {
    throw new Error('Invalid random length request.');
  }
}
