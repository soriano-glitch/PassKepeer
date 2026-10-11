declare const __DEV__: boolean;

const SENSITIVE_KEYS = /password|secret|key|token|salt|note|ciphertext|plaintext/i;

function redact(value: unknown): unknown {
  if (Array.isArray(value)) {
    return value.map((entry) => redact(entry));
  }
  if (value !== null && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>).map(([k, v]) =>
        SENSITIVE_KEYS.test(k) ? [k, '[REDACTED]'] : [k, redact(v)],
      ),
    );
  }
  return value;
}

export const log = {
  info: (msg: string, ctx?: unknown): void => {
    if (__DEV__) {
      console.info(msg, redact(ctx));
    }
  },
  error: (msg: string, ctx?: unknown): void => {
    console.error(msg, redact(ctx));
  },
};

export function redactForTest(value: unknown): unknown {
  return redact(value);
}
