import { RequestHandler } from 'express';
import { PetTypesRepository } from '../repositories/petTypes';
import { makePetType } from '../models/petTypes';
import { validateGetPetTypes } from '../validators/petTypes';
import { makePagedResult } from '../../../utils/paging';
import { getCurrentUrl } from '../../../utils/url';

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

export const makeGetPetTypesHandler = (
  petTypesRepository: PetTypesRepository
): RequestHandler => async (req, res, next) => {
  try {
    const pagingOptions = await validateGetPetTypes(req);
    const petTypes = await petTypesRepository.getPetTypes();
    const pagedResult = makePagedResult(
      petTypes,
      pagingOptions,
      getCurrentUrl(req)
    );

    res.status(200).json(pagedResult);
  } catch (error) {
    next(error);
  }
};
