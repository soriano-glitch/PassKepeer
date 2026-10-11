import type { VaultEntryPlaintext } from '../../types/vault';

export interface PrototypeEntry extends VaultEntryPlaintext {
  id: string;
  category: string;
  isFavorite: boolean;
  createdAt: string;
  updatedAt: string;
  /** Insertion order; tiebreaks entries created within the same millisecond. */
  seq: number;
}

export interface NewPrototypeEntry extends VaultEntryPlaintext {
  category: string;
}

/**
 * PROTOTYPE ONLY. Holds plaintext entries in process memory with no
 * encryption, no persistence, and no lock screen. Never enter real
 * credentials. The production store replaces this class behind the same
 * method shapes once the op-sqlite + libsodium PoC passes on device.
 */
export class PrototypeMemoryStore {
  private entries = new Map<string, PrototypeEntry>();
  private seq = 0;
  private nextId = 1;

  list(): PrototypeEntry[] {
    return [...this.entries.values()].sort((a, b) => b.seq - a.seq);
  }

  get(id: string): PrototypeEntry | null {
    return this.entries.get(id) ?? null;
  }

  create(input: NewPrototypeEntry): PrototypeEntry {
    const now = new Date().toISOString();
    // Counter IDs: expo-crypto randomUUID is mocked to a constant under
    // jest-expo, which would collide. Production uses real UUIDs.
    const entry: PrototypeEntry = { ...input, id: `entry-${this.nextId++}`, isFavorite: false, createdAt: now, updatedAt: now, seq: this.seq++ };
    this.entries.set(entry.id, entry);
    return entry;
  }

  update(id: string, patch: Partial<NewPrototypeEntry>): PrototypeEntry {
    const existing = this.entries.get(id);
    if (!existing) throw new Error('Entry not found.');
    const updated: PrototypeEntry = { ...existing, ...patch, id, updatedAt: new Date().toISOString() };
    this.entries.set(id, updated);
    return updated;
  }

  remove(id: string): void {
    if (!this.entries.delete(id)) throw new Error('Entry not found.');
  }

  toggleFavorite(id: string): PrototypeEntry {
    const existing = this.entries.get(id);
    if (!existing) throw new Error('Entry not found.');
    const updated: PrototypeEntry = {
      ...existing,
      isFavorite: !existing.isFavorite,
      updatedAt: new Date().toISOString(),
    };
    this.entries.set(id, updated);
    return updated;
  }

  search(query: string): PrototypeEntry[] {
    const q = query.trim().toLowerCase();
    if (q.length === 0) return this.list();
    return this.list().filter(
      (e) =>
        e.title.toLowerCase().includes(q) ||
        e.username.toLowerCase().includes(q) ||
        e.url.toLowerCase().includes(q),
    );
  }

  favorites(): PrototypeEntry[] {
    return this.list().filter((e) => e.isFavorite);
  }

  clear(): void {
    this.entries.clear();
  }
}

let singleton: PrototypeMemoryStore | null = null;

export function getPrototypeStore(): PrototypeMemoryStore {
  if (!singleton) singleton = new PrototypeMemoryStore();
  return singleton;
}
