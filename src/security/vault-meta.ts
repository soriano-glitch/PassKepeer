import {
  hasHardwareAsync,
  isEnrolledAsync,
} from 'expo-local-authentication';
import {
  AFTER_FIRST_UNLOCK_THIS_DEVICE_ONLY,
  canUseBiometricAuthentication,
  deleteItemAsync,
  getItemAsync,
  setItemAsync,
} from 'expo-secure-store';
import { base64ToBytes, bytesToBase64 } from '../utils/base64';
import {
  BiometricCancelledError,
  BiometricInvalidatedError,
  BiometricUnavailableError,
  type VaultSecrets,
} from './vault-keys';

const META_KEY = 'passkeeper.vault.meta.v1';
const BIO_KEY = 'passkeeper.vault.biometric-vdk.v1';

export interface StoredVaultMeta {
  secrets: VaultSecrets;
  biometricEnabled: boolean;
  createdAt: string;
}

function parseMeta(raw: string): StoredVaultMeta {
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    throw new Error('Vault metadata is corrupt and unreadable.');
  }
  const meta = parsed as Partial<StoredVaultMeta>;
  if (!meta || typeof meta !== 'object' || !meta.secrets || typeof meta.secrets.wrappedVdkB64 !== 'string') {
    throw new Error('Vault metadata is corrupt and unreadable.');
  }
  return {
    secrets: meta.secrets,
    biometricEnabled: meta.biometricEnabled === true,
    createdAt: typeof meta.createdAt === 'string' ? meta.createdAt : '',
  };
}

export async function vaultExists(): Promise<boolean> {
  return (await getItemAsync(META_KEY)) !== null;
}

export async function readVaultMeta(): Promise<StoredVaultMeta | null> {
  const raw = await getItemAsync(META_KEY);
  return raw === null ? null : parseMeta(raw);
}

export async function writeVaultMeta(meta: StoredVaultMeta): Promise<void> {
  await setItemAsync(META_KEY, JSON.stringify(meta), {
    keychainAccessible: AFTER_FIRST_UNLOCK_THIS_DEVICE_ONLY,
  });
}

export async function deleteVaultMeta(): Promise<void> {
  await deleteItemAsync(META_KEY).catch(() => undefined);
  await deleteItemAsync(BIO_KEY).catch(() => undefined);
}

export interface BiometricStatus {
  available: boolean;
  enrolled: boolean;
  canGateKeys: boolean;
}

export async function biometricStatus(): Promise<BiometricStatus> {
  const [hardware, enrolled] = await Promise.all([hasHardwareAsync(), isEnrolledAsync()]);
  let canGateKeys = false;
  try {
    canGateKeys = canUseBiometricAuthentication();
  } catch {
    canGateKeys = false;
  }
  return { available: hardware, enrolled, canGateKeys };
}

/**
 * Stores a device-bound wrapped copy of the VDK behind biometric-gated
 * Keychain/Keystore access control. The prompt alone authorizes key release;
 * it never replaces the KDF path.
 */
export async function enableBiometricUnlock(vdk: Uint8Array, prompt: string): Promise<void> {
  const status = await biometricStatus();
  if (!status.available || !status.enrolled) {
    throw new BiometricUnavailableError('No enrolled biometrics on this device.');
  }
  await setItemAsync(BIO_KEY, bytesToBase64(vdk), {
    requireAuthentication: true,
    authenticationPrompt: prompt,
    keychainAccessible: AFTER_FIRST_UNLOCK_THIS_DEVICE_ONLY,
  });
}

export async function disableBiometricUnlock(): Promise<void> {
  await deleteItemAsync(BIO_KEY).catch(() => undefined);
}

/**
 * Releases the VDK through the biometric-gated key. getItemAsync itself
 * raises the system prompt (single prompt by design — no pre-prompt).
 * Resolves null when the system invalidated the key (re-enrollment) — the
 * caller must fall back to the master password. Rejects on cancel/failure
 * with no key release.
 */
export async function unlockWithBiometrics(prompt: string): Promise<Uint8Array | null> {
  let raw: string | null;
  try {
    raw = await getItemAsync(BIO_KEY, { requireAuthentication: true, authenticationPrompt: prompt });
  } catch {
    throw new BiometricCancelledError();
  }
  if (raw === null) return null;
  try {
    const vdk = base64ToBytes(raw);
    if (vdk.length !== 32) throw new BiometricInvalidatedError();
    return vdk;
  } catch (err) {
    if (err instanceof BiometricInvalidatedError) throw err;
    throw new BiometricInvalidatedError();
  }
}
