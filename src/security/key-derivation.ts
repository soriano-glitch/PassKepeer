/**
 * Argon2id key-derivation contract.
 * Params must be chosen by measurement on a low-end physical device and
 * checked against current OWASP guidance. Do not copy numbers from docs.
 *
 * Version history: 0 = interim salted iterated-SHA-512 software KDF shipped
 * so the unlock flow works before native Argon2id is validated on device.
 * It is CPU-hard only, not memory-hard, and must be upgraded. 1 = Argon2id
 * (reserved; requesting it before the PoC validates libsodium fails closed).
 */
export interface KdfParams {
  memKiB: number;
  iterations: number;
  parallelism: number;
  saltB64: string;
  version: 0 | 1;
}

export interface Kdf {
  derive(password: string, params: KdfParams, outLen: 32): Promise<Uint8Array>;
}

export function validateKdfParams(params: KdfParams): void {
  // memKiB 0 is legal for the interim software KDF (memory-hardness n/a);
  // Argon2id rejects it at derivation time instead of here.
  if (!Number.isInteger(params.memKiB) || params.memKiB < 0) {
    throw new Error('Invalid KDF memory parameter.');
  }
  if (!Number.isInteger(params.iterations) || params.iterations <= 0) {
    throw new Error('Invalid KDF iteration parameter.');
  }
  if (!Number.isInteger(params.parallelism) || params.parallelism <= 0) {
    throw new Error('Invalid KDF parallelism parameter.');
  }
  if (params.version !== 0 && params.version !== 1) {
    throw new Error('Unsupported KDF params version.');
  }
  if (typeof params.saltB64 !== 'string' || params.saltB64.length < 22) {
    throw new Error('Invalid KDF salt.');
  }
}
