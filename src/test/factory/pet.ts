import { NewPetDto, NewPet, Pet } from '../../features/pet/models/pet';
import { PetsRepository } from '../../features/pet/repositories/pet';
import { DBClient } from '../../database';
import { stub } from 'sinon';
import { PetHealthService } from '../../features/pet/services/pet-health';

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

export const createPet = (pet: Partial<Pet> = {}) => {
  const { id = 1, name = 'burek', petTypeId = 1, userId = 1 } = pet;

  return Object.freeze({
    id,
    name,
    petTypeId,
    userId,
  });
};

export const makeFakePetRepositoryFactory = (
  opts: Partial<PetsRepository> = {}
) => {
  const {
    saveNewPet = stub().returns(Promise.resolve()),
    findOne = stub().returns(Promise.resolve()),
  } = opts;

  return (dbClient: DBClient): PetsRepository => ({
    saveNewPet,
    findOne,
  });
};

export const makeFakePetHealthServiceFactory = (
  opts: Partial<PetHealthService> = {}
) => {
  const { getPetsHealth = stub().returns(Promise.resolve(0)) } = opts;

  return (): PetHealthService => ({
    getPetsHealth,
  });
};
