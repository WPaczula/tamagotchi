import { PetTypesRepository } from '../../features/pet/repositories';
import { stub } from 'sinon';
import { DBClient } from '../../database';
import { NewPetType, PetType } from '../../features/pet/models/petTypes';
import {
  NewPetProperty,
  PetProperty,
} from '../../features/pet/models/petProperty';

export const createNewPetProperty = (
  opts: Partial<NewPetProperty> = {}
): NewPetProperty => {
  const {
    name = 'hunger',
    value = 100,
    weight = 100,
    valuePerTime = 1 / 1000,
  } = opts;

  return Object.freeze({
    name,
    value,
    weight,
    valuePerTime,
  });
};

export const createPetProperty = (
  opts: Partial<PetProperty> = {}
): PetProperty => {
  const {
    id = 0,
    name = 'hunger',
    value = 100,
    weight = 100,
    valuePerTime = 1 / 1000,
  } = opts;

  return Object.freeze({
    id,
    name,
    value,
    weight,
    valuePerTime,
  });
};

export const createNewPetType = (
  opts: Partial<NewPetType> = {}
): NewPetType => {
  const { name = 'Capybara', properties = [createNewPetProperty()] } = opts;

  return Object.freeze({
    name,
    properties,
  });
};

export const createPetType = (opts: Partial<PetType> = {}): PetType => {
  const {
    name = 'CapyBara',
    id = 0,
    properties = [createPetProperty()],
  } = opts;

  return Object.freeze({
    id,
    name,
    properties,
  });
};

export const makeFakePetTypesRepositoryFactory = (
  opts: Partial<PetTypesRepository> = {}
) => {
  const {
    createPetType = stub().returns(Promise.resolve()),
    find = stub().returns(Promise.resolve([])),
    findOne = stub().returns(Promise.resolve()),
    checkIfPropertyExists = stub().returns(Promise.resolve(true)),
  } = opts;

  return (dbClient: DBClient): PetTypesRepository => ({
    createPetType,
    find,
    findOne,
    checkIfPropertyExists,
  });
};
