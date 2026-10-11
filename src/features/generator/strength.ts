export type StrengthLabel = 'Very weak' | 'Weak' | 'Fair' | 'Strong' | 'Very strong';

export interface StrengthEstimate {
  entropyBits: number;
  score: 0 | 1 | 2 | 3 | 4;
  label: StrengthLabel;
}

/**
 * Rough entropy heuristic from password length and detected character
 * classes. It is not a breach check, a blocklist check, or a guessability
 * proof: "Password123!" scores fairly here yet falls to any dictionary.
 */
export function estimateStrength(password: string): StrengthEstimate {
  let pool = 0;
  if (/[a-z]/.test(password)) pool += 26;
  if (/[A-Z]/.test(password)) pool += 26;
  if (/[0-9]/.test(password)) pool += 10;
  if (/[^a-zA-Z0-9]/.test(password)) pool += 32;
  const entropyBits = password.length === 0 ? 0 : password.length * Math.log2(Math.max(pool, 2));
  let score: StrengthEstimate['score'] = 0;
  let label: StrengthLabel = 'Very weak';
  if (entropyBits >= 100) {
    score = 4;
    label = 'Very strong';
  } else if (entropyBits >= 60) {
    score = 3;
    label = 'Strong';
  } else if (entropyBits >= 36) {
    score = 2;
    label = 'Fair';
  } else if (entropyBits >= 28) {
    score = 1;
    label = 'Weak';
  }
  return { entropyBits: Math.round(entropyBits), score, label };
}
