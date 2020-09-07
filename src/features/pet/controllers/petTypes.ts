import { RequestHandler } from 'express';
import { PetTypesRepository } from '../repositories/petTypes';
import { makePetType } from '../models/petTypes';
import { validateGetPetTypes } from '../validators/petTypes';
import { makePagedResult } from '../../../utils/paging';
import { getCurrentUrl } from '../../../utils/url';
import createHandler from '../../../utils/create-handler';

export const makeCreatePetTypeHandler = (
  petTypesRepository: PetTypesRepository
): RequestHandler =>
  createHandler(async (req, res) => {
    const { name, properties } = req.body;

    const petType = await petTypesRepository.findOne({ name });
    if (petType) {
      res.status(409);
      throw new Error(`Pet type ${name} already exists`);
    }

    const newPetType = await makePetType(name, properties);
    await petTypesRepository.createPetType(newPetType);
    res.status(201).end();
  });

export const makeGetPetTypesHandler = (
  petTypesRepository: PetTypesRepository
): RequestHandler =>
  createHandler(async (req, res) => {
    const pagingOptions = await validateGetPetTypes(req);
    const petTypes = await petTypesRepository.find();
    const pagedResult = makePagedResult(
      petTypes,
      pagingOptions,
      getCurrentUrl(req)
    );

    res.status(200).json(pagedResult);
  });
