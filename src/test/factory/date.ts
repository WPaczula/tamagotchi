import { DateService } from '../../features/pet/utils/date';
import { stub } from 'sinon';

export const makeFakeDateService = (
  opts: Partial<DateService> = {}
): DateService => {
  const {
    calculatePassedTime = stub().returns(0),
    getCurrentDate = () => new Date(),
  } = opts;

  return Object.freeze({
    calculatePassedTime,
    getCurrentDate,
  });
};
