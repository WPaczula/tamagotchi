export const expiresIn = (hours: number) => {
  const now = Date.now();

  return new Date(now + hours * 3600000);
};
