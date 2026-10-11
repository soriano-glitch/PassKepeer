import { describe, expect, test } from '@jest/globals';
import { openEncryptedDatabase } from '../../src/database/connection.js';

describe('fail-closed storage', () => {
  test('refuses to open without a verified encrypted backend', async () => {
    await expect(openEncryptedDatabase({ fileName: 'vault.db', key: new Uint8Array(32) })).rejects.toThrow(
      /refusing plaintext fallback|no verified SQLCipher/i,
    );
  });
});
