import { Router } from 'express';
import { makeGetUsersHandler } from '../controllers';
import { DBClient } from '../../../database';
import { makeUsersRepository } from '../repositories';

export const makeUsersRoutes = (client: DBClient) => {
  const usersRepository = makeUsersRepository(client);
  const router = Router();

  router.get('/', makeGetUsersHandler(usersRepository));

  return router;
};
