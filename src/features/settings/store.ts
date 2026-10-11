import { validateAutoLockMs, DEFAULT_AUTO_LOCK_MS } from '../../services/auto-lock';
import { validateClipboardTimeout, DEFAULT_CLIPBOARD_CLEAR_MS } from '../../services/clipboard';

export interface PrototypeSettings {
  clipboardClearMs: number;
  autoLockMs: number;
}

/**
 * Prototype settings held in memory for the session. Survives navigation,
 * resets on restart — same lifecycle as the prototype memory store.
 */
class PrototypeSettingsStore {
  private settings: PrototypeSettings = {
    clipboardClearMs: DEFAULT_CLIPBOARD_CLEAR_MS,
    autoLockMs: DEFAULT_AUTO_LOCK_MS,
  };

  get(): PrototypeSettings {
    return { ...this.settings };
  }

  setClipboardClearMs(ms: number): PrototypeSettings {
    validateClipboardTimeout(ms);
    this.settings.clipboardClearMs = ms;
    return this.get();
  }

  setAutoLockMs(ms: number): PrototypeSettings {
    validateAutoLockMs(ms);
    this.settings.autoLockMs = ms;
    return this.get();
  }
}

let singleton: PrototypeSettingsStore | null = null;

export function getPrototypeSettingsStore(): PrototypeSettingsStore {
  if (!singleton) singleton = new PrototypeSettingsStore();
  return singleton;
}
