import { NewPetDto, NewPet } from '../../features/pet/models/pet';
import { PetsRepository } from '../../features/pet/repositories/pet';
import { DBClient } from '../../database';
import { stub } from 'sinon';

export const createNewPetDto = (dto: Partial<NewPetDto> = {}) => {
  const { name = 'burek', petTypeId = 1 } = dto;

  return Object.freeze({
    name,
    petTypeId,
  });
};

export const createNewPet = (newPet: Partial<NewPet> = {}) => {
  const { name = 'burek', petTypeId = 1, userId = 1 } = newPet;

  return Object.freeze({
    name,
    petTypeId,
    userId,
  });
};

export const makeFakePetRepositoryFactory = (
  opts: Partial<PetsRepository> = {}
) => {
  const { saveNewPet = stub().returns(Promise.resolve()) } = opts;

  return (dbClient: DBClient): PetsRepository => ({
    saveNewPet,
  });
};
