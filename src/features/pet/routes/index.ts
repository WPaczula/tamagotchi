import { Router } from 'express';
import { requireAuthentication } from '../../../middlewares';
import { makeCreatePetTypeHandler } from '../controllers/petTypes';
import { makePetTypesRepository } from '../repositories/petTypes';
import { DBClient } from '../../../database';

export const makePetTypeRoutes = (dbClient: DBClient) => {
  const router = Router();

  const petTypesRepository = makePetTypesRepository(dbClient);

  router.post(
    '/',
    requireAuthentication,
    makeCreatePetTypeHandler(petTypesRepository)
  );

  return router;
};
