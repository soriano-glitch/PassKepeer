import { describe, expect, test } from '@jest/globals';
import { packSealed, unpackSealed } from '../../src/security/aes-aead';
import { validateKdfParams } from '../../src/security/key-derivation';
import { INTERIM_KDF_VERSION } from '../../src/security/interim-kdf';

describe('sealed wire format (pure packing)', () => {
  test('packs and unpacks nonce and body', () => {
    const nonce = new Uint8Array(12).fill(7);
    const body = new Uint8Array([...new Uint8Array([1, 2, 3, 4]), ...new Uint8Array(16).fill(9)]);
    const blob = packSealed(nonce, body);
    expect(blob.length).toBe(12 + 4 + 16);
    const parts = unpackSealed(blob);
    expect(parts.nonce).toEqual(nonce);
    expect(parts.ciphertextAndTag).toEqual(body);
  });

  test('rejects short or malformed blobs before touching crypto', () => {
    expect(() => unpackSealed(new Uint8Array(10))).toThrow();
    expect(() => packSealed(new Uint8Array(8), new Uint8Array(4))).toThrow();
  });
});

describe('versioned KDF params', () => {
  test('accepts interim version 0 and reserved Argon2id version 1', () => {
    const base = { memKiB: 0, iterations: 200_000, parallelism: 1, saltB64: 'AAAAAAAAAAAAAAAAAAAAAA' };
    expect(() => validateKdfParams({ ...base, version: INTERIM_KDF_VERSION })).not.toThrow();
    expect(() => validateKdfParams({ ...base, memKiB: 65536, version: 1 })).not.toThrow();
    expect(() =>
      validateKdfParams({ ...base, version: 2 as unknown as 0 }),
    ).toThrow();
  });
});
