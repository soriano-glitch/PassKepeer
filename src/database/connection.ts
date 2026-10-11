import { EncryptionUnavailableError } from '../security/encryption';

export interface DbConnectionOptions {
  fileName: string;
  key: Uint8Array;
}

/**
 * Fail-closed connection contract. Implementations must throw
 * EncryptionUnavailableError and never open an unencrypted database
 * when the encrypted backend is unavailable.
 */
export interface EncryptedDb {
  close(): Promise<void>;
  isOpen(): boolean;
}

export async function openEncryptedDatabase(_options: DbConnectionOptions): Promise<EncryptedDb> {
  throw new EncryptionUnavailableError(
    'Phase 1: no verified SQLCipher backend yet. Run the PoC before persisting data.',
  );
}
