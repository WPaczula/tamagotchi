import { PetActionsRepository } from '../../features/pet/repositories';
import { stub } from 'sinon';
import { DBClient } from '../../database';
import { NewPetAction, PetAction } from '../../features/pet/models/petAction';

export const makeFakePetActionsRepositoryFactory = (
  opts: Partial<PetActionsRepository> = {}
) => {
  const {
    getAllPetActions = stub().returns(Promise.resolve([])),
    saveNewPetAction = stub().returns(Promise.resolve()),
    findOne = stub().returns(Promise.resolve(undefined)),
  } = opts;

  return (dbClient: DBClient): PetActionsRepository => ({
    getAllPetActions,
    saveNewPetAction,
    findOne,
  });
};

export const createNewPetAction = (
  opts: Partial<NewPetAction> = {}
): NewPetAction => {
  const { name = 'feed', petTypeId = 1, petModifierIds = [1] } = opts;

  return Object.freeze({
    name,
    petTypeId,
    petModifierIds,
  });
};

export const createPetAction = (opts: Partial<PetAction> = {}): PetAction => {
  const { name = 'feed', petTypeId = 1, petModifierIds = [1], id = 1 } = opts;

  return Object.freeze({
    id,
    name,
    petTypeId,
    petModifierIds,
  });
};
