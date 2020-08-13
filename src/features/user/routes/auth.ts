import { Router } from 'express';
import { makeRegisterHandler } from '../controllers';
import { DBClient } from '../../../database';
import { makeUsersRepository } from '../repositories';

export const makeAuthRoutes = (client: DBClient) => {
  const usersRepository = makeUsersRepository(client);
  const router = Router();

  router.post('/register', makeRegisterHandler(usersRepository));

  return router;
};
