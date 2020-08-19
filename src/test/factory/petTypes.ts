import { PetTypesRepository } from '../../features/pet/repositories';
import { stub } from 'sinon';
import { DBClient } from '../../database';
import { NewPetType } from '../../features/pet/models/petTypes';

export const createNewPetType = (opts: Partial<NewPetType>) => {
  const { name = 'Capybara' } = opts;

  return {
    name,
  };
};

export const makeFakePetTypesRepositoryFactory = (
  opts: Partial<PetTypesRepository> = {}
) => {
  const { createPetType = stub().returns(Promise.resolve()) } = opts;

  return (dbClient: DBClient): PetTypesRepository => ({
    createPetType,
  });
};
