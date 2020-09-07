import bcrypt from 'bcryptjs';

export const hash = (text: string): Promise<string> => {
  return bcrypt.hash(text, 2);
};
export type HashFunction = typeof hash;

export const compareHash = (hash: string, text: string): Promise<boolean> => {
  return bcrypt.compare(text, hash);
};
export type CompareHashFunction = typeof compareHash;
