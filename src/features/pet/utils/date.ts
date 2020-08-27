export const calculatePassedTime = (past: Date) => {
  return Date.now() - past.getTime();
};
export type PassedTimeCalculationFunction = typeof calculatePassedTime;
