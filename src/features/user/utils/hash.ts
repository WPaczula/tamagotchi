import bcrypt from 'bcryptjs';

export const hash = async (text: string): Promise<string> => {
  const hashedText = await bcrypt.hash(text, 2);

  return hashedText;
};
export type HashFunction = typeof hash;
