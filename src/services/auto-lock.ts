export const DEFAULT_AUTO_LOCK_MS = 2 * 60 * 1000;

export function validateAutoLockMs(ms: number): void {
  if (!Number.isInteger(ms) || ms < 15_000 || ms > 30 * 60 * 1000) {
    throw new Error('Auto-lock must be between 15s and 30min.');
  }
}

export class AutoLocker {
  private timer: ReturnType<typeof setTimeout> | null = null;

  constructor(
    private readonly timeoutMs: number,
    private readonly onLock: () => void,
  ) {
    validateAutoLockMs(timeoutMs);
  }

  notifyActivity(): void {
    if (this.timer !== null) {
      clearTimeout(this.timer);
    }
    this.timer = setTimeout(() => this.onLock(), this.timeoutMs);
  }

  stop(): void {
    if (this.timer !== null) {
      clearTimeout(this.timer);
      this.timer = null;
    }
  }
}
