import { Router } from 'express';
import { requireAuthentication } from '../../../middlewares';
import {
  makeCreatePetActionHandler,
  makeGetAllPetActions,
} from '../controllers/petAction';
import {
  makePetTypesRepository,
  makePetModifiersRepository,
  makePetActionsRepository,
} from '../repositories';
import { DBClient } from '../../../database';

export const makePetActionsRoutes = (dbClient: DBClient) => {
  const router = Router();

  const petTypesRepository = makePetTypesRepository(dbClient);
  const petModifiersRepository = makePetModifiersRepository(dbClient);
  const petActionsRepository = makePetActionsRepository(dbClient);

  router.post(
    '/',
    requireAuthentication,
    makeCreatePetActionHandler(
      petTypesRepository,
      petModifiersRepository,
      petActionsRepository
    )
  );

  router.get(
    '/',
    requireAuthentication,
    makeGetAllPetActions(petActionsRepository)
  );

  return router;
};
