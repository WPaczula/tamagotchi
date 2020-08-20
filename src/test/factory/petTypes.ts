import { PetTypesRepository } from '../../features/pet/repositories';
import { stub } from 'sinon';
import { DBClient } from '../../database';
import { NewPetType, PetType } from '../../features/pet/models/petTypes';

export const createNewPetType = (opts: Partial<NewPetType>) => {
  const { name = 'Capybara' } = opts;

  return Object.freeze({
    name,
  });
};

export const createPetType = (opts: Partial<PetType>) => {
  const { name = 'CapyBara', id = 0 } = opts;

  return Object.freeze({
    id,
    name,
  });
};

export const makeFakePetTypesRepositoryFactory = (
  opts: Partial<PetTypesRepository> = {}
) => {
  const {
    createPetType = stub().returns(Promise.resolve()),
    find = stub().returns(Promise.resolve([])),
    findOne = stub().returns(Promise.resolve()),
  } = opts;

  return (dbClient: DBClient): PetTypesRepository => ({
    createPetType,
    find,
    findOne,
  });
};
