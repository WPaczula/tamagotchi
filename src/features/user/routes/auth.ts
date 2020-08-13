import { Router } from 'express';
import { makeRegisterHandler } from '../controllers';
import { DBClient } from '../../../database';
import { makeUsersRepository } from '../repositories';
import { makeNewUserFactory } from '../models/auth';
import { hash } from '../utils/hash';

export const makeAuthRoutes = (client: DBClient) => {
  const usersRepository = makeUsersRepository(client);
  const newUserFactory = makeNewUserFactory(hash);
  const router = Router();

  router.post(
    '/register',
    makeRegisterHandler(usersRepository, newUserFactory)
  );

  return router;
};
