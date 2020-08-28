import { PetPropertiesRepository } from '../../features/pet/repositories/petProperty';
import { stub } from 'sinon';

export const makeFakePropertyRepository = (
  opts: Partial<PetPropertiesRepository> = {}
): PetPropertiesRepository => {
  const {
    getProperties = stub().returns(Promise.resolve([])),
    getPropertyValues = stub().returns(Promise.resolve([])),
    savePropertyValues = stub().returns(Promise.resolve()),
  } = opts;

  return Object.freeze({
    getProperties,
    getPropertyValues,
    savePropertyValues,
  });
};
