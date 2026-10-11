/**
 * Argon2id key-derivation contract.
 * Params must be chosen by measurement on a low-end physical device and
 * checked against current OWASP guidance. Do not copy numbers from docs.
 */
export interface KdfParams {
  memKiB: number;
  iterations: number;
  parallelism: number;
  saltB64: string;
  version: 1;
}

export interface Kdf {
  derive(password: string, params: KdfParams, outLen: 32): Promise<Uint8Array>;
}

export function validateKdfParams(params: KdfParams): void {
  if (!Number.isInteger(params.memKiB) || params.memKiB <= 0) {
    throw new Error('Invalid KDF memory parameter.');
  }
  if (!Number.isInteger(params.iterations) || params.iterations <= 0) {
    throw new Error('Invalid KDF iteration parameter.');
  }
  if (!Number.isInteger(params.parallelism) || params.parallelism <= 0) {
    throw new Error('Invalid KDF parallelism parameter.');
  }
  if (params.version !== 1) {
    throw new Error('Unsupported KDF params version.');
  }
  if (typeof params.saltB64 !== 'string' || params.saltB64.length < 22) {
    throw new Error('Invalid KDF salt.');
  }
}
