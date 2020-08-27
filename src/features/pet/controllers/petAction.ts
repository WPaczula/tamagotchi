import { RequestHandler } from 'express';
import { makeNewPetAction } from '../models/petAction';
import {
  PetTypesRepository,
  PetModifiersRepository,
  PetActionsRepository,
} from '../repositories';
import { validateGetPetTypes } from '../validators/petTypes';
import { makePagedResult } from '../../../utils/paging';
import { getCurrentUrl } from '../../../utils/url';

export const makeCreatePetActionHandler = (
  petTypesRepository: PetTypesRepository,
  petModifiersRepository: PetModifiersRepository,
  petActionsRepository: PetActionsRepository
): RequestHandler => async (req, res, next) => {
  const { name, petTypeId, petModifierIds } = req.body;

  try {
    const petAction = await makeNewPetAction(name, petTypeId, petModifierIds);

    const petType = await petTypesRepository.findOne({
      id: petAction.petTypeId,
    });
    if (!petType) {
      res.status(404);
      next(
        new Error(`Pet type with id ${petAction.petTypeId} could not be found`)
      );
    }

    const foundPetModifierIds = await petModifiersRepository.checkExistingIds(
      petAction.petModifierIds
    );
    if (foundPetModifierIds.length !== petAction.petModifierIds.length) {
      res.status(404);
      const missingIds: number[] = [];
      petAction.petModifierIds.forEach((modifierId) => {
        if (!foundPetModifierIds.includes(modifierId)) {
          missingIds.push(modifierId);
        }
      });
      next(
        new Error(
          `Could not find pet modifier with id(s) ${missingIds.toString()}`
        )
      );
    }

    await petActionsRepository.saveNewPetAction(petAction);

    res.status(201).end();
  } catch (e) {
    next(e);
  }
};

export const makeGetAllPetActions = (
  petActionsRepository: PetActionsRepository
): RequestHandler => async (req, res, next) => {
  try {
    const pagingOptions = await validateGetPetTypes(req);
    const actions = await petActionsRepository.getAllPetActions();
    const pagedResult = makePagedResult(
      actions,
      pagingOptions,
      getCurrentUrl(req)
    );

    res.status(200).json(pagedResult);
  } catch (error) {
    next(error);
  }
};
