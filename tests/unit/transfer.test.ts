import { describe, expect, test } from '@jest/globals';
import { parseTransfer, restoreTransfer, serializeTransfer } from '../../src/features/backup/transfer';
import { PrototypeMemoryStore } from '../../src/features/vault/memory-store';

function makeStore() {
  const store = new PrototypeMemoryStore();
  const a = store.create({ title: 'A', username: 'a@x', password: 'pw-a-12345', url: '', notes: 'n', category: 'Email' });
  store.toggleFavorite(a.id);
  store.create({ title: 'B', username: '', password: 'pw-b-12345', url: 'https://b', notes: '', category: 'Nope-over-40-chars-xxxxxxxxxxxxxxxxxxxxxxxxxxxx' });
  return store;
}

describe('prototype transfer', () => {
  test('round-trips entries including favorites', () => {
    const json = serializeTransfer(makeStore().list());
    const back = new PrototypeMemoryStore();
    expect(restoreTransfer(back, json)).toEqual({ imported: 2 });
    expect(back.list().map((e) => e.title).sort()).toEqual(['A', 'B']);
    expect(back.favorites().map((e) => e.title)).toEqual(['A']);
    expect(back.list().find((e) => e.title === 'B')?.category).toBe('Other');
  });

  test('rejects bad versions and shapes', () => {
    expect(() => parseTransfer('not json')).toThrow();
    expect(() => parseTransfer(JSON.stringify({ formatVersion: 99, entries: [] }))).toThrow();
    expect(() => parseTransfer(JSON.stringify({ formatVersion: 1, entries: [{ title: '', password: 'x' }] }))).toThrow();
  });

  test('failed restore leaves the store untouched', () => {
    const store = makeStore();
    expect(() => restoreTransfer(store, '{"formatVersion":1,"entries":[{"nope":true}]}')).toThrow();
    expect(store.list()).toHaveLength(2);
  });
});
