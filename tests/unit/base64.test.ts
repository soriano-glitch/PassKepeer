import { describe, expect, test } from '@jest/globals';
import { base64ToBytes, bytesToBase64 } from '../../src/utils/base64';

describe('base64 codec', () => {
  test('round-trips every length 0..64', () => {
    for (let len = 0; len <= 64; len++) {
      const bytes = new Uint8Array(len).map((_, i) => (i * 37 + 11) % 256);
      expect(base64ToBytes(bytesToBase64(bytes))).toEqual(bytes);
    }
  });

  test('matches known vectors', () => {
    expect(bytesToBase64(new Uint8Array([104, 105]))).toBe('aGk=');
    expect(base64ToBytes('aGk=')).toEqual(new Uint8Array([104, 105]));
    expect(bytesToBase64(new Uint8Array(0))).toBe('');
  });

  test('rejects malformed input', () => {
    expect(() => base64ToBytes('abc')).toThrow();
    expect(() => base64ToBytes('!!!~')).toThrow();
  });
});
