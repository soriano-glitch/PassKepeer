import type { SecureRandom } from '../../security/secure-random';
import type { PasswordGeneratorOptions } from '../../types/vault';
import { buildAlphabet } from './charset';

/**
 * Generates a password by rejection sampling: random bytes that fall outside
 * an unbiased range are discarded instead of reduced with modulo, so no
 * character is favored when the alphabet size does not divide 256.
 */
export async function generatePassword(
  opts: PasswordGeneratorOptions,
  random: SecureRandom,
): Promise<string> {
  const alphabet = buildAlphabet(opts);
  const unbiasedLimit = Math.floor(256 / alphabet.length) * alphabet.length;
  if (unbiasedLimit <= 0) {
    throw new Error('Alphabet is too large for unbiased byte sampling.');
  }
  const out: string[] = [];
  while (out.length < opts.length) {
    const batch = await random.bytes(Math.min((opts.length - out.length) * 2, 128));
    for (const byte of batch) {
      if (byte < unbiasedLimit) {
        const ch = alphabet[byte % alphabet.length];
        if (ch === undefined) continue;
        out.push(ch);
        if (out.length === opts.length) break;
      }
    }
  }
  return out.join('');
}
