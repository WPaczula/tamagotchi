import { RequestHandler } from 'express';
import { PetsRepository } from '../repositories/pet';
import { PetTypesRepository } from '../repositories';
import { makeNewPet } from '../models/pet';
import { User } from '../../user/models/user';

export const makeCreatePetHandler = (
  petTypesRepository: PetTypesRepository,
  petsRepository: PetsRepository
): RequestHandler => async (req, res, next) => {
  const { name, petTypeId } = req.body;
  const { id } = req.user as User;

  try {
    const pet = await makeNewPet(name, petTypeId, id);

    const petType = await petTypesRepository.findOne({
      id: pet.petTypeId,
    });
    if (!petType) {
      res.status(404);
      next(new Error(`Pet type with id ${pet.petTypeId} could not be found`));
    }

    await petsRepository.saveNewPet(pet);

    res.status(201).end();
  } catch (e) {
    next(e);
  }
};
