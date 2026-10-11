import { CryptoDigestAlgorithm, digest } from 'expo-crypto';
import { base64ToBytes, bytesToBase64 } from '../utils/base64';
import { AesGcmAead } from './aes-aead';
import { type Kdf, type KdfParams } from './key-derivation';
import { expoSecureRandom } from './expo-random';
import { defaultInterimKdfParams, INTERIM_KDF_SALT_BYTES } from './interim-kdf';

/** Domain for the VDK wrap, bound as AAD so wraps never cross contexts. */
export const VDK_WRAP_AAD = 'passkeeper/vdk-wrap/v1';
export const VDK_BYTES = 32;

export class WrongPasswordError extends Error {
  constructor() {
    super('Incorrect master password.');
    this.name = 'WrongPasswordError';
  }
}

export class BiometricUnavailableError extends Error {
  constructor(message = 'Biometric unlock is not available on this device.') {
    super(message);
    this.name = 'BiometricUnavailableError';
  }
}

export class BiometricInvalidatedError extends Error {
  constructor() {
    super('Biometric key was invalidated (enrollment changed). Use your master password.');
    this.name = 'BiometricInvalidatedError';
  }
}

export class BiometricCancelledError extends Error {
  constructor() {
    super('Biometric authentication did not complete. No key was released.');
    this.name = 'BiometricCancelledError';
  }
}

export interface VaultSecrets {
  kdfParams: KdfParams;
  /** KEK-wrapped VDK (nonce || ciphertext || tag), base64. */
  wrappedVdkB64: string;
}

function zeroize(bytes: Uint8Array): void {
  bytes.fill(0);
}

async function unwrapVdk(kdf: Kdf, password: string, secrets: VaultSecrets): Promise<Uint8Array> {
  const kek = await kdf.derive(password, secrets.kdfParams, 32);
  try {
    return await new AesGcmAead().decrypt(
      kek,
      base64ToBytes(secrets.wrappedVdkB64),
      new TextEncoder().encode(VDK_WRAP_AAD),
    );
  } catch {
    throw new WrongPasswordError();
  } finally {
    zeroize(kek);
  }
}

/**
 * Master-password vault operations. The password is never stored; it derives
 * a KEK that unwraps the random VDK. Changing the password re-wraps the same
 * VDK — no mass re-encryption.
 */
export async function createVaultSecrets(
  kdf: Kdf,
  password: string,
  saltB64?: string,
): Promise<VaultSecrets> {
  const salt = saltB64 ?? bytesToBase64(await expoSecureRandom.bytes(INTERIM_KDF_SALT_BYTES));
  const params = defaultInterimKdfParams(salt);
  const kek = await kdf.derive(password, params, 32);
  const vdk = await expoSecureRandom.bytes(VDK_BYTES);
  try {
    const wrapped = await new AesGcmAead().encrypt(
      kek,
      vdk,
      new TextEncoder().encode(VDK_WRAP_AAD),
    );
    return { kdfParams: params, wrappedVdkB64: bytesToBase64(wrapped) };
  } finally {
    zeroize(kek);
    zeroize(vdk);
  }
}

export async function unlockWithPassword(
  kdf: Kdf,
  password: string,
  secrets: VaultSecrets,
): Promise<Uint8Array> {
  return unwrapVdk(kdf, password, secrets);
}

export async function changeVaultPassword(
  kdf: Kdf,
  oldPassword: string,
  newPassword: string,
  secrets: VaultSecrets,
): Promise<VaultSecrets> {
  const vdk = await unwrapVdk(kdf, oldPassword, secrets);
  try {
    const salt = bytesToBase64(await expoSecureRandom.bytes(INTERIM_KDF_SALT_BYTES));
    const params = defaultInterimKdfParams(salt);
    const newKek = await kdf.derive(newPassword, params, 32);
    try {
      const wrapped = await new AesGcmAead().encrypt(
        newKek,
        vdk,
        new TextEncoder().encode(VDK_WRAP_AAD),
      );
      return { kdfParams: params, wrappedVdkB64: bytesToBase64(wrapped) };
    } finally {
      zeroize(newKek);
    }
  } finally {
    zeroize(vdk);
  }
}

/** Derives a purpose-separated subkey from the VDK (domain separation via label). */
export async function deriveSubkey(vdk: Uint8Array, label: string): Promise<Uint8Array> {
  const out = await digest(
    CryptoDigestAlgorithm.SHA512,
    new Uint8Array([...vdk, ...new TextEncoder().encode(`passkeeper/${label}/v1`)]),
  );
  return new Uint8Array(out).slice(0, 32);
}
