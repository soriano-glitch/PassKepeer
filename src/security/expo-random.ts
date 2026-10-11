import { getRandomBytesAsync } from 'expo-crypto';
import { assertRandomLength, type SecureRandom } from './secure-random';

/**
 * SecureRandom backed by expo-crypto. Uses the async variant deliberately:
 * the sync getRandomBytes falls back to Math.random under the React Native
 * debugger, which must never feed password generation.
 */
export class ExpoSecureRandom implements SecureRandom {
  async bytes(length: number): Promise<Uint8Array> {
    assertRandomLength(length);
    return getRandomBytesAsync(length);
  }
}

export const expoSecureRandom = new ExpoSecureRandom();
