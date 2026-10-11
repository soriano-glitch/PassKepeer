import { validateGeneratorOptions, type PasswordGeneratorOptions } from '../../types/vault';

export const UPPER = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
export const LOWER = 'abcdefghijklmnopqrstuvwxyz';
export const DIGITS = '0123456789';
export const SYMBOLS = '!@#$%^&*()-_=+[]{};:,.<>?/~';

/** Characters that read ambiguously in most fonts. */
const AMBIGUOUS = new Set(['I', 'l', '1', '|', 'O', '0']);

export function buildAlphabet(opts: PasswordGeneratorOptions): string {
  validateGeneratorOptions(opts);
  let alphabet = '';
  if (opts.useUpper) alphabet += UPPER;
  if (opts.useLower) alphabet += LOWER;
  if (opts.useDigits) alphabet += DIGITS;
  if (opts.useSymbols) alphabet += SYMBOLS;
  if (opts.excludeAmbiguous) {
    alphabet = [...alphabet].filter((c) => !AMBIGUOUS.has(c)).join('');
  }
  if (alphabet.length === 0) {
    throw new Error('Character exclusion removed every candidate character.');
  }
  return alphabet;
}
