import { CryptoDigestAlgorithm, digest } from 'expo-crypto';
import { base64ToBytes } from '../utils/base64';
import { validateKdfParams, type Kdf, type KdfParams } from './key-derivation';

export const INTERIM_KDF_VERSION = 0 as const;
export const INTERIM_KDF_ITERATIONS = 200_000;
export const INTERIM_KDF_SALT_BYTES = 16;
export const INTERIM_KDF_OUT_BYTES = 32;

function concat(...parts: Uint8Array[]): Uint8Array {
  const total = parts.reduce((n, p) => n + p.length, 0);
  const out = new Uint8Array(total);
  let offset = 0;
  for (const p of parts) {
    out.set(p, offset);
    offset += p.length;
  }
  return out;
}

async function sha512(data: Uint8Array): Promise<Uint8Array> {
  const out = await digest(CryptoDigestAlgorithm.SHA512, new Uint8Array(data));
  return new Uint8Array(out);
}

export function defaultInterimKdfParams(saltB64: string): KdfParams {
  return { memKiB: 0, iterations: INTERIM_KDF_ITERATIONS, parallelism: 1, saltB64, version: 0 };
}

/**
 * Interim software KDF (params version 0): salted iterated SHA-512.
 * Construction: h0 = SHA512(salt || password); hi = SHA512(h(i-1) || password || salt),
 * truncated to 32 bytes. Only vetted primitives, no custom hash logic.
 *
 * This is CPU-hard only — it is NOT memory-hard and NOT a substitute for
 * Argon2id. It exists so the unlock flow works before native Argon2id is
 * validated on device. params.version 1 (Argon2id) fails closed until then,
 * and every vault stores its params so version 0 vaults upgrade by re-wrap.
 */
export class InterimSoftwareKdf implements Kdf {
  async derive(password: string, params: KdfParams, outLen: 32): Promise<Uint8Array> {
    validateKdfParams(params);
    if (params.version !== INTERIM_KDF_VERSION) {
      throw new Error('Argon2id is reserved for the on-device PoC; refusing to substitute.');
    }
    if (params.iterations < 1 || params.iterations > 5_000_000) {
      throw new Error('KDF iteration count out of range.');
    }
    const salt = base64ToBytes(params.saltB64);
    if (salt.length < INTERIM_KDF_SALT_BYTES) throw new Error('KDF salt too short.');
    const pw = new TextEncoder().encode(password);
    let state = await sha512(concat(salt, pw));
    for (let i = 1; i < params.iterations; i++) {
      state = await sha512(concat(state, pw, salt));
    }
    return state.slice(0, outLen);
  }
}
