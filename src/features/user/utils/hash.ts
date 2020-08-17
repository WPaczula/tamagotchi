import bcrypt from 'bcryptjs';

export const hash = async (text: string): Promise<string> => {
  const hashedText = await bcrypt.hash(text, 2);

  return hashedText;
};
export type HashFunction = typeof hash;

export const compareHash = async (
  hash: string,
  text: string
): Promise<boolean> => {
  const isValid = await bcrypt.compare(text, hash);

  return isValid;
};
export type CompareHashFunction = typeof compareHash;
