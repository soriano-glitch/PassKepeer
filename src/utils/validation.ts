export function isNonEmptyString(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0;
}

export function requireNonEmptyString(value: unknown, field: string): string {
  if (!isNonEmptyString(value)) {
    throw new Error(`Invalid ${field}: expected non-empty string.`);
  }
  return value.trim();
}
