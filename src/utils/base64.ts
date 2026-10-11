const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';

/**
 * Base64 codec for key blobs. This is byte encoding, not cryptography:
 * it carries no secrecy and must only wrap already-encrypted material.
 */
export function bytesToBase64(bytes: Uint8Array): string {
  let out = '';
  for (let i = 0; i < bytes.length; i += 3) {
    const a = bytes[i] as number;
    const b = i + 1 < bytes.length ? (bytes[i + 1] as number) : 0;
    const c = i + 2 < bytes.length ? (bytes[i + 2] as number) : 0;
    const triple = (a << 16) | (b << 8) | c;
    out += ALPHABET[(triple >> 18) & 63];
    out += ALPHABET[(triple >> 12) & 63];
    out += i + 1 < bytes.length ? ALPHABET[(triple >> 6) & 63] : '=';
    out += i + 2 < bytes.length ? ALPHABET[triple & 63] : '=';
  }
  return out;
}

export function base64ToBytes(b64: string): Uint8Array {
  if (b64.length % 4 !== 0) throw new Error('Malformed base64 length.');
  if (!/^[A-Za-z0-9+/]*={0,2}$/.test(b64)) throw new Error('Malformed base64 characters.');
  const rev = new Map<string, number>([...ALPHABET].map((c, i) => [c, i]));
  const padding = b64.endsWith('==') ? 2 : b64.endsWith('=') ? 1 : 0;
  const out = new Uint8Array(((b64.length / 4) | 0) * 3 - padding);
  let o = 0;
  for (let i = 0; i < b64.length; i += 4) {
    const sextets = [b64[i], b64[i + 1], b64[i + 2], b64[i + 3]].map((ch) =>
      ch === '=' ? 0 : (rev.get(ch as string) as number),
    );
    const triple =
      ((sextets[0] as number) << 18) |
      ((sextets[1] as number) << 12) |
      ((sextets[2] as number) << 6) |
      (sextets[3] as number);
    if (o < out.length) out[o++] = (triple >> 16) & 255;
    if (o < out.length) out[o++] = (triple >> 8) & 255;
    if (o < out.length) out[o++] = triple & 255;
  }
  return out;
}
