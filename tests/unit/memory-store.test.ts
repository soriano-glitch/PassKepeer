import { describe, expect, test } from '@jest/globals';
import { PrototypeMemoryStore } from '../../src/features/vault/memory-store';
import { isDefaultCategory, normalizeCategoryName } from '../../src/features/vault/categories';

function makeStore() {
  const store = new PrototypeMemoryStore();
  store.create({ title: 'Mail', username: 'a@x.com', password: 'p1', url: 'https://m.x', notes: '', category: 'Email' });
  store.create({ title: 'Bank', username: 'b@x.com', password: 'p2', url: 'https://b.x', notes: '', category: 'Banking' });
  return store;
}

describe('prototype memory store', () => {
  test('creates and lists newest-first', () => {
    const store = makeStore();
    expect(store.list().map((e) => e.title)).toEqual(['Bank', 'Mail']);
  });

  test('search matches title, username, url', () => {
    const store = makeStore();
    expect(store.search('mail').map((e) => e.title)).toEqual(['Mail']);
    expect(store.search('b@x.com').map((e) => e.title)).toEqual(['Bank']);
    expect(store.search('')).toHaveLength(2);
  });

  test('favorite toggle flips state', () => {
    const store = makeStore();
    const id = store.list()[0]?.id as string;
    expect(store.toggleFavorite(id).isFavorite).toBe(true);
    expect(store.toggleFavorite(id).isFavorite).toBe(false);
    expect(store.favorites()).toHaveLength(0);
  });

  test('update and remove', () => {
    const store = makeStore();
    const id = store.list()[0]?.id as string;
    expect(store.update(id, { title: 'Vault' }).title).toBe('Vault');
    store.remove(id);
    expect(store.list()).toHaveLength(1);
    expect(() => store.remove(id)).toThrow();
  });

  test('categories validate', () => {
    expect(isDefaultCategory('Email')).toBe(true);
    expect(isDefaultCategory('Nope')).toBe(false);
    expect(normalizeCategoryName('  Work  ')).toBe('Work');
    expect(() => normalizeCategoryName('   ')).toThrow();
  });
});
