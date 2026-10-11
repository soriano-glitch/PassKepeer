import { normalizeCategoryName } from '../vault/categories';
import { requireNonEmptyString } from '../../utils/validation';
import type { PrototypeEntry, PrototypeMemoryStore } from '../vault/memory-store';

export const TRANSFER_FORMAT_VERSION = 1 as const;

export interface TransferEntry {
  title: string;
  username: string;
  password: string;
  url: string;
  notes: string;
  category: string;
  isFavorite: boolean;
}

export interface TransferFile {
  formatVersion: 1;
  exportedAt: string;
  app: 'passkeeper-prototype';
  /** Always true here: this is a plaintext prototype transfer, never a secure backup. */
  unencrypted: true;
  entries: TransferEntry[];
}

/**
 * Plaintext prototype transfer format. It exercises the export/import
 * mechanics (versioning, validation, transactional restore) with demo data.
 * It must never carry real credentials and never replaces the encrypted
 * backup format, which needs the on-device crypto PoC first.
 */
export function serializeTransfer(entries: PrototypeEntry[]): string {
  const file: TransferFile = {
    formatVersion: TRANSFER_FORMAT_VERSION,
    exportedAt: new Date().toISOString(),
    app: 'passkeeper-prototype',
    unencrypted: true,
    entries: entries.map((e) => ({
      title: e.title,
      username: e.username,
      password: e.password,
      url: e.url,
      notes: e.notes,
      category: e.category,
      isFavorite: e.isFavorite,
    })),
  };
  return JSON.stringify(file, null, 2);
}

function toTransferEntry(raw: unknown): TransferEntry {
  if (typeof raw !== 'object' || raw === null) throw new Error('Entry must be an object.');
  const r = raw as Record<string, unknown>;
  const categoryRaw = typeof r['category'] === 'string' ? (r['category'] as string) : 'Other';
  let category = 'Other';
  try {
    category = normalizeCategoryName(categoryRaw);
  } catch {
    category = 'Other';
  }
  return {
    title: requireNonEmptyString(r['title'], 'entry title'),
    username: typeof r['username'] === 'string' ? (r['username'] as string) : '',
    password: requireNonEmptyString(r['password'], 'entry password'),
    url: typeof r['url'] === 'string' ? (r['url'] as string) : '',
    notes: typeof r['notes'] === 'string' ? (r['notes'] as string) : '',
    category,
    isFavorite: r['isFavorite'] === true,
  };
}

export function parseTransfer(text: string): TransferFile {
  let parsed: unknown;
  try {
    parsed = JSON.parse(text);
  } catch {
    throw new Error('Not valid JSON. Paste a transfer file exported from Settings.');
  }
  if (typeof parsed !== 'object' || parsed === null) throw new Error('Transfer must be an object.');
  const file = parsed as Record<string, unknown>;
  if (file['formatVersion'] !== TRANSFER_FORMAT_VERSION) {
    throw new Error(`Unsupported transfer version (expected ${TRANSFER_FORMAT_VERSION}).`);
  }
  if (!Array.isArray(file['entries'])) throw new Error('Transfer has no entries array.');
  const entries = (file['entries'] as unknown[]).map(toTransferEntry);
  return {
    formatVersion: TRANSFER_FORMAT_VERSION,
    exportedAt: typeof file['exportedAt'] === 'string' ? (file['exportedAt'] as string) : '',
    app: 'passkeeper-prototype',
    unencrypted: true,
    entries,
  };
}

/**
 * Transactional restore: the text is fully validated before the store is
 * touched, so a corrupt file never leaves a half-imported vault.
 */
export function restoreTransfer(store: PrototypeMemoryStore, text: string): { imported: number } {
  const file = parseTransfer(text);
  store.clear();
  for (const t of file.entries) {
    const created = store.create({
      title: t.title,
      username: t.username,
      password: t.password,
      url: t.url,
      notes: t.notes,
      category: t.category,
    });
    if (t.isFavorite) store.toggleFavorite(created.id);
  }
  return { imported: file.entries.length };
}
