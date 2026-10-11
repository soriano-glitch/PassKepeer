/**
 * Key hierarchy (proposed, pending PoC):
 * Master password -> Argon2id(salt_m) -> KEK -> AEAD-unwrap -> VDK (256-bit).
 * VDK derives DB key via HKDF("db") and field key via HKDF("fields").
 * Biometric path stores a device-bound wrapped copy of the VDK.
 * Backup path encrypts exports under a key from Argon2id(recovery password, salt_b).
 */
export interface PassKeeperHierarchy {
  kekSaltB64: string;
  wrappedVdkB64: string;
  kdfMemKiB: number;
  kdfIterations: number;
  kdfParallelism: number;
  paramsVersion: 1;
}

export type UnlockMethod = 'master-password' | 'biometric';

export interface KeyManager {
  createVault(masterPassword: string): Promise<PassKeeperHierarchy>;
  unlockWithPassword(masterPassword: string, stored: PassKeeperHierarchy): Promise<Uint8Array>;
  wrapWithBiometric(vdk: Uint8Array): Promise<string>;
  unlockWithBiometric(wrappedForBiometricB64: string): Promise<Uint8Array>;
  changePassword(oldPassword: string, newPassword: string, stored: PassKeeperHierarchy): Promise<PassKeeperHierarchy>;
}

export const KEY_HIERARCHY_VERSION = 1 as const;
