export interface VaultEntryPlaintext {
  title: string;
  username: string;
  password: string;
  url: string;
  notes: string;
}

export interface PasswordGeneratorOptions {
  length: number;
  useUpper: boolean;
  useLower: boolean;
  useDigits: boolean;
  useSymbols: boolean;
  excludeAmbiguous: boolean;
}

export function validateGeneratorOptions(opts: PasswordGeneratorOptions): void {
  if (!Number.isInteger(opts.length) || opts.length < 8 || opts.length > 128) {
    throw new Error('Generator length must be between 8 and 128.');
  }
  if (!opts.useUpper && !opts.useLower && !opts.useDigits && !opts.useSymbols) {
    throw new Error('Generator must enable at least one character class.');
  }
}
