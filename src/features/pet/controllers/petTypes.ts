import { RequestHandler } from 'express';
import { PetTypesRepository } from '../repositories/petTypes';
import { makePetType } from '../models/petTypes';

export const makeCreatePetTypeHandler = (
  petTypesRepository: PetTypesRepository
): RequestHandler => async (req, res, next) => {
  const { name } = req.body;

  try {
    const newPetType = await makePetType(name);
    await petTypesRepository.createPetType(newPetType);
    res.status(201).end();
  } catch (error) {
    next(error);
  }
};
