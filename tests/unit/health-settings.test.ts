import { describe, expect, test } from '@jest/globals';
import { checkVaultHealth } from '../../src/features/health/checks';
import { getPrototypeSettingsStore } from '../../src/features/settings/store';
import type { PrototypeEntry } from '../../src/features/vault/memory-store';

function entry(patch: Partial<PrototypeEntry> & { id: string }): PrototypeEntry {
  return {
    title: 'T',
    username: 'u@x.com',
    password: 'aB3$xY9!qW2#eR5&zLp',
    url: 'https://x.com',
    notes: '',
    category: 'Email',
    isFavorite: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    seq: 0,
    ...patch,
  };
}

describe('health checks', () => {
  test('flags weak, reused, missing fields', () => {
    const weak = entry({ id: '1', password: 'abc' });
    const reusedA = entry({ id: '2', password: 'SamePass99!!', username: '' });
    const reusedB = entry({ id: '3', password: 'SamePass99!!', url: '' });
    const { issues, counts } = checkVaultHealth([weak, reusedA, reusedB]);
    expect(counts.weak).toBe(1);
    expect(counts.reused).toBe(2);
    expect(counts['missing-username']).toBe(1);
    expect(counts['missing-url']).toBe(1);
    expect(issues).toHaveLength(3);
  });

  test('flags stale entries', () => {
    const old = entry({ id: '1', updatedAt: new Date(Date.now() - 200 * 86400000).toISOString() });
    const { counts } = checkVaultHealth([old]);
    expect(counts.stale).toBe(1);
  });

  test('clean vault has no issues', () => {
    expect(checkVaultHealth([entry({ id: '1' })]).issues).toHaveLength(0);
  });
});

describe('prototype settings store', () => {
  test('defaults and validation', () => {
    const store = getPrototypeSettingsStore();
    expect(store.get().clipboardClearMs).toBe(30_000);
    expect(store.setClipboardClearMs(15_000).clipboardClearMs).toBe(15_000);
    expect(() => store.setClipboardClearMs(1000)).toThrow();
    expect(() => store.setAutoLockMs(1000)).toThrow();
    store.setClipboardClearMs(30_000);
  });
});
