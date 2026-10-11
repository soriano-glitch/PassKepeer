export interface ClipboardService {
  copyAndScheduleClear(text: string, clearAfterMs: number): Promise<void>;
  clear(): Promise<void>;
}

export const DEFAULT_CLIPBOARD_CLEAR_MS = 30_000;

export function validateClipboardTimeout(ms: number): void {
  if (!Number.isInteger(ms) || ms < 5_000 || ms > 120_000) {
    throw new Error('Clipboard timeout must be between 5s and 120s.');
  }
}
