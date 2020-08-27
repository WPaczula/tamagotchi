import { RequestHandler } from 'express';
import { PetsRepository } from '../repositories/pet';
import { PetTypesRepository } from '../repositories';
import { makeNewPet, PetDto } from '../models/pet';
import { User } from '../../user/models/user';
import { PetHealthService } from '../services/pet-health';
import { validatePetId } from '../validators/pet';

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
      throw new Error(`Pet type with id ${pet.petTypeId} could not be found`);
    }

    await petsRepository.saveNewPet(pet);

    res.status(201).end();
  } catch (e) {
    next(e);
  }
};

export const makeGetPetHandler = (
  petsRepository: PetsRepository,
  petHealthService: PetHealthService
): RequestHandler => async (req, res, next) => {
  try {
    const id = await validatePetId(req);
    const pet = await petsRepository.findOne({ id });

    if (!pet) {
      res.status(404);
      throw new Error(`Pet with id ${id} could not be found.`);
    }

    const petsHealth = await petHealthService.getPetsHealth(pet);

    const petDto: PetDto = {
      ...pet,
      health: petsHealth,
    };

    res.status(200).json(petDto);
  } catch (e) {
    next(e);
  }
};
