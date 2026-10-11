export interface CredentialRecord {
  id: string;
  titleCipher: Uint8Array;
  usernameCipher: Uint8Array;
  passwordCipher: Uint8Array;
  urlCipher: Uint8Array;
  notesCipher: Uint8Array;
  categoryId: string | null;
  isFavorite: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CredentialRepository {
  list(): Promise<CredentialRecord[]>;
  get(id: string): Promise<CredentialRecord | null>;
  create(record: CredentialRecord): Promise<void>;
  update(record: CredentialRecord): Promise<void>;
  remove(id: string): Promise<void>;
}
