import { AESEncryptionKey, AESSealedData, aesDecryptAsync, aesEncryptAsync } from 'expo-crypto';
import type { Aead } from './encryption';

export const AES_GCM_NONCE_BYTES = 12;
export const AES_GCM_TAG_BYTES = 16;

/** Wire format: nonce (12) || ciphertext || tag (16). */
export function packSealed(nonce: Uint8Array, ciphertextAndTag: Uint8Array): Uint8Array {
  if (nonce.length !== AES_GCM_NONCE_BYTES) throw new Error('Sealed blob has a bad nonce length.');
  const out = new Uint8Array(nonce.length + ciphertextAndTag.length);
  out.set(nonce, 0);
  out.set(ciphertextAndTag, nonce.length);
  return out;
}

export function unpackSealed(blob: Uint8Array): { nonce: Uint8Array; ciphertextAndTag: Uint8Array } {
  if (blob.length < AES_GCM_NONCE_BYTES + AES_GCM_TAG_BYTES + 1) {
    throw new Error('Sealed blob is too short to be valid.');
  }
  return {
    nonce: blob.slice(0, AES_GCM_NONCE_BYTES),
    ciphertextAndTag: blob.slice(AES_GCM_NONCE_BYTES),
  };
}

/**
 * AEAD over AES-256-GCM (expo-crypto, native + web). Random 12-byte nonce per
 * encryption. Tampered or wrong-key blobs fail closed in decrypt.
 */
export class AesGcmAead implements Aead {
  async encrypt(key: Uint8Array, plaintext: Uint8Array, aad?: Uint8Array): Promise<Uint8Array> {
    const cryptoKey = await AESEncryptionKey.import(key);
    const sealed = await aesEncryptAsync(
      plaintext,
      cryptoKey,
      aad === undefined ? undefined : { additionalData: new Uint8Array(aad) },
    );
    const nonce = await sealed.iv();
    const body = await sealed.ciphertext({ includeTag: true });
    if (!(nonce instanceof Uint8Array) || !(body instanceof Uint8Array)) {
      throw new Error('AES backend returned an unexpected encoding.');
    }
    return packSealed(nonce, body);
  }

  async decrypt(key: Uint8Array, blob: Uint8Array, aad?: Uint8Array): Promise<Uint8Array> {
    const { nonce, ciphertextAndTag } = unpackSealed(blob);
    const cryptoKey = await AESEncryptionKey.import(key);
    const sealed = AESSealedData.fromParts(nonce, ciphertextAndTag);
    const out =
      aad === undefined
        ? await aesDecryptAsync(sealed, cryptoKey, { output: 'bytes' })
        : await aesDecryptAsync(sealed, cryptoKey, { output: 'bytes', additionalData: new Uint8Array(aad) });
    if (typeof out === 'string') throw new Error('AES backend returned an unexpected encoding.');
    return out;
  }
}
