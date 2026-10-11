export const BACKUP_FORMAT_VERSION = 1 as const;

export interface BackupHeader {
  formatVersion: 1;
  kdfMemKiB: number;
  kdfIterations: number;
  kdfParallelism: number;
  saltB64: string;
}

export interface EncryptedBackupFile {
  header: BackupHeader;
  payloadB64: string;
}

export function validateBackupHeader(header: BackupHeader): void {
  if (header.formatVersion !== BACKUP_FORMAT_VERSION) {
    throw new Error('Unsupported backup format version.');
  }
  if (typeof header.saltB64 !== 'string' || header.saltB64.length < 22) {
    throw new Error('Invalid backup salt.');
  }
}
