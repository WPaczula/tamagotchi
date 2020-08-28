export const makeDateService = () => {
  const service = {
    calculatePassedTime: (past: Date) => {
      return Date.now() - past.getTime();
    },

    getCurrentDate: () => new Date(),
  };

  return Object.freeze(service);
};

export type DateService = ReturnType<typeof makeDateService>;
