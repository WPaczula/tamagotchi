import { RequestHandler } from 'express';
import { PetsRepository } from '../repositories/pet';
import { PetTypesRepository, PetActionsRepository } from '../repositories';
import { makeNewPet, PetDto } from '../models/pet';
import { User } from '../../user/models/user';
import { PetHealthService } from '../services/pet-health';
import { validatePetId, validateApplyActionRequest } from '../validators/pet';
import { PetActionsService } from '../services/pet-action';
import createHandler from '../../../utils/create-handler';

export const makeCreatePetHandler = (
  petTypesRepository: PetTypesRepository,
  petsRepository: PetsRepository
): RequestHandler =>
  createHandler(async (req, res) => {
    const { name, petTypeId } = req.body;
    const { id } = req.user as User;

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
  });

export const makeGetPetHandler = (
  petsRepository: PetsRepository,
  petHealthService: PetHealthService
): RequestHandler =>
  createHandler(async (req, res) => {
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
  });

export const makeApplyActionHandler = (
  petsRepository: PetsRepository,
  actionsRepository: PetActionsRepository,
  petActionService: PetActionsService
): RequestHandler =>
  createHandler(async (req, res) => {
    const { petId, actionId } = await validateApplyActionRequest(req);
    const { id: userId } = req.user as User;

    const pet = await petsRepository.findOne({ id: petId });
    if (!pet || pet.userId !== userId) {
      res.status(404);
      throw new Error(`Pet with id ${petId} was not found`);
    }

    const action = await actionsRepository.findOne({ id: actionId });
    if (!action) {
      res.status(404);
      throw new Error(`Pet action with id ${actionId} was not found`);
    }

    await petActionService.applyAction(pet, action);

    res.status(204).end();
  });
