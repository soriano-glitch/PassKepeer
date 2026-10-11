export {};

const g = globalThis as { __DEV__?: boolean };
if (typeof g.__DEV__ === 'undefined') {
  g.__DEV__ = true;
}
