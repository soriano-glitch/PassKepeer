import { describe, expect, test } from '@jest/globals';
import { redactForTest } from '../../src/services/logger';
import { validateKdfParams } from '../../src/security/key-derivation';
import { validateGeneratorOptions } from '../../src/types/vault';
import { validateBackupHeader } from '../../src/services/backup';
import { validateClipboardTimeout } from '../../src/services/clipboard';

describe('Phase 1 contracts', () => {
  test('logger redacts sensitive keys', () => {
    const out = redactForTest({ password: 'x', title: 'y', nested: { salt: 's', ok: 1 } }) as Record<string, unknown>;
    expect(out['password']).toBe('[REDACTED]');
    expect(out['title']).toBe('y');
    expect((out['nested'] as Record<string, unknown>)['salt']).toBe('[REDACTED]');
  });

  test('KDF params reject bad input', () => {
    expect(() =>
      validateKdfParams({ memKiB: -1, iterations: 1, parallelism: 1, saltB64: 'AAAAAAAAAAAAAAAAAAAAAA', version: 1 }),
    ).toThrow();
  });

  test('generator rejects empty character classes', () => {
    expect(() =>
      validateGeneratorOptions({
        length: 16,
        useUpper: false,
        useLower: false,
        useDigits: false,
        useSymbols: false,
        excludeAmbiguous: false,
      }),
    ).toThrow();
  });

  test('backup rejects unknown format version', () => {
    expect(() =>
      validateBackupHeader({
        // @ts-expect-error deliberate bad version
        formatVersion: 99,
        kdfMemKiB: 1,
        kdfIterations: 1,
        kdfParallelism: 1,
        saltB64: 'AAAAAAAAAAAAAAAAAAAAAA',
      }),
    ).toThrow();
  });

  test('clipboard timeout bounds hold', () => {
    expect(() => validateClipboardTimeout(1000)).toThrow();
    expect(() => validateClipboardTimeout(30_000)).not.toThrow();
  });
});
