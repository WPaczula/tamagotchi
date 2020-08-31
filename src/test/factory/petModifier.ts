import { PetModifiersRepository } from '../../features/pet/repositories/petModifier';
import { stub } from 'sinon';
import { DBClient } from '../../database';
import { NewPetModifier } from '../../features/pet/models/petModifier';

export const makeFakePetModifiersRepositoryFactory = (
  opts: Partial<PetModifiersRepository> = {}
) => {
  const {
    saveNewPetModifier = stub().returns(Promise.resolve()),
    checkExistingIds = stub().returns(Promise.resolve([])),
    findByIds = stub().returns(Promise.resolve([])),
  } = opts;

  return (dbClient: DBClient): PetModifiersRepository => ({
    saveNewPetModifier,
    checkExistingIds,
    findByIds,
  });
};

export const createPetModifier = (
  opts: Partial<NewPetModifier> = {}
): NewPetModifier => {
  const { name = 'food', property = 'hunger', modifier = 100 } = opts;

  return Object.freeze({
    name,
    property,
    modifier,
  });
};
