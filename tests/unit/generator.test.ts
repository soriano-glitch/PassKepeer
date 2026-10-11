import { describe, expect, test } from '@jest/globals';
import type { SecureRandom } from '../../src/security/secure-random';
import type { PasswordGeneratorOptions } from '../../src/types/vault';
import { buildAlphabet } from '../../src/features/generator/charset';
import { generatePassword } from '../../src/features/generator/generate';
import { estimateStrength } from '../../src/features/generator/strength';

const BASE: PasswordGeneratorOptions = {
  length: 12,
  useUpper: true,
  useLower: true,
  useDigits: true,
  useSymbols: true,
  excludeAmbiguous: false,
};

class StubRandom implements SecureRandom {
  private cursor = 0;
  constructor(private readonly stream: number[]) {}
  async bytes(length: number): Promise<Uint8Array> {
    const out = new Uint8Array(length);
    for (let i = 0; i < length; i++) {
      out[i] = this.stream[this.cursor++ % this.stream.length] as number;
    }
    return out;
  }
}

describe('generator', () => {
  test('rejects empty character classes', async () => {
    const bad: PasswordGeneratorOptions = { ...BASE, useUpper: false, useLower: false, useDigits: false, useSymbols: false };
    await expect(generatePassword(bad, new StubRandom([0]))).rejects.toThrow();
  });

  test('rejects out-of-range length', async () => {
    await expect(generatePassword({ ...BASE, length: 4 }, new StubRandom([0]))).rejects.toThrow();
  });

  test('maps bytes deterministically through the alphabet', async () => {
    const alphabet = buildAlphabet(BASE);
    const first = alphabet[0] as string;
    const pw = await generatePassword({ ...BASE, length: 8 }, new StubRandom([0]));
    expect(pw).toBe(first.repeat(8));
  });

  test('rejection sampling discards biased bytes', async () => {
    // Alphabet of 90 chars: unbiased limit = floor(256/90)*90 = 180.
    // Byte 200 must be skipped, byte 0 accepted.
    const pw = await generatePassword({ ...BASE, length: 8 }, new StubRandom([200, 0]));
    const alphabet = buildAlphabet(BASE);
    expect(pw).toBe((alphabet[0] as string).repeat(8));
  });

  test('ambiguous exclusion removes Il1|O0', () => {
    const alphabet = buildAlphabet({ ...BASE, excludeAmbiguous: true });
    for (const c of ['I', 'l', '1', '|', 'O', '0']) {
      expect(alphabet).not.toContain(c);
    }
  });

  test('strength bands behave', () => {
    expect(estimateStrength('').score).toBe(0);
    expect(estimateStrength('abc').label).toBe('Very weak');
    const strong = estimateStrength('aB3$xY9!qW2#eR5&');
    expect(strong.score).toBeGreaterThanOrEqual(3);
  });
});
