import { estimateStrength } from '../generator/strength';
import type { PrototypeEntry } from '../vault/memory-store';

export type HealthKind = 'weak' | 'reused' | 'missing-username' | 'missing-url' | 'stale';

export interface HealthIssue {
  entryId: string;
  title: string;
  kinds: HealthKind[];
}

export interface VaultHealth {
  issues: HealthIssue[];
  counts: Record<HealthKind, number>;
}

/** Flags entries older than this as potentially outdated. */
export const STALE_AFTER_DAYS = 180;

export const HEALTH_LABELS: Record<HealthKind, string> = {
  weak: 'Weak password',
  reused: 'Reused password',
  'missing-username': 'Missing username',
  'missing-url': 'Missing URL',
  stale: 'Possibly outdated',
};

/**
 * Local-only password health checks. Heuristic and metadata-based: weak uses
 * the entropy estimator, stale uses timestamps. Never contacts a network.
 */
export function checkVaultHealth(entries: PrototypeEntry[]): VaultHealth {
  const counts: Record<HealthKind, number> = {
    weak: 0,
    reused: 0,
    'missing-username': 0,
    'missing-url': 0,
    stale: 0,
  };
  const passwordUse = new Map<string, number>();
  for (const e of entries) {
    if (e.password.length > 0) passwordUse.set(e.password, (passwordUse.get(e.password) ?? 0) + 1);
  }
  const staleCutoff = Date.now() - STALE_AFTER_DAYS * 24 * 60 * 60 * 1000;
  const issues: HealthIssue[] = [];
  for (const e of entries) {
    const kinds = new Set<HealthKind>();
    if (e.password.length > 0 && estimateStrength(e.password).score <= 1) kinds.add('weak');
    if (e.password.length > 0 && (passwordUse.get(e.password) ?? 0) > 1) kinds.add('reused');
    if (e.username.trim().length === 0) kinds.add('missing-username');
    if (e.url.trim().length === 0) kinds.add('missing-url');
    if (Date.parse(e.updatedAt) < staleCutoff) kinds.add('stale');
    if (kinds.size > 0) {
      const list = [...kinds];
      for (const k of list) counts[k] += 1;
      issues.push({ entryId: e.id, title: e.title, kinds: list });
    }
  }
  return { issues, counts };
}
