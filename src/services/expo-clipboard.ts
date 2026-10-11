import { setStringAsync } from 'expo-clipboard';
import {
  DEFAULT_CLIPBOARD_CLEAR_MS,
  validateClipboardTimeout,
  type ClipboardService,
} from './clipboard';

/**
 * Clipboard copy with best-effort timed clearing. Clearing writes an empty
 * string after the timeout; platforms may already have replaced the content
 * (Android 13+ auto-redacts sensitive clips), so callers must not promise
 * guaranteed clearing.
 */
export class ExpoClipboardService implements ClipboardService {
  async copyAndScheduleClear(text: string, clearAfterMs: number): Promise<void> {
    validateClipboardTimeout(clearAfterMs);
    const ok = await setStringAsync(text);
    if (!ok) throw new Error('System clipboard refused the content.');
    setTimeout(() => {
      setStringAsync('').catch(() => undefined);
    }, clearAfterMs);
  }

  async clear(): Promise<void> {
    await setStringAsync('');
  }
}

export const expoClipboard = new ExpoClipboardService();
export { DEFAULT_CLIPBOARD_CLEAR_MS };
