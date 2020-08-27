import { DBClient } from './database';
import config from 'config';
import express from 'express';
import morgan from 'morgan';
import helmet from 'helmet';
import cors from 'cors';
import { errorHandler, notFound } from './middlewares';
import { makeUsersRoutes, makeAuthRoutes } from './features/user/routes';
import initializeSwagger from './utils/initialize-swagger';
import { initializeAuthentication } from './features/user/middlewares/auth';
import { makeUsersRepository } from './features/user/repositories';
import { compareHash } from './features/user/utils/hash';
import { initializeRedis } from './utils/initialize-redis';
import {
  makePetModifiersRoutes,
  makePetActionsRoutes,
  makePetTypeRoutes,
  makePetsRoutes,
} from './features/pet/routes';

const makeServer = async (dbClient: DBClient) => {
  const app = express();

  initializeSwagger(app);

  // apply middlewares
  app.use(express.json());
  if (process.env.NODE_ENV !== 'test') {
    app.use(morgan('common'));
  }
  app.use(helmet());
  app.use(cors());

  const redisStore = initializeRedis();
  initializeAuthentication(
    app,
    redisStore,
    makeUsersRepository(dbClient),
    compareHash
  );

  // add routes
  app.get('/', (req, res) => {
    res.json({ message: 'hello world' });
  });
  app.use('/', makeAuthRoutes(dbClient));
  app.use('/users', makeUsersRoutes(dbClient));
  app.use('/petTypes', makePetTypeRoutes(dbClient));
  app.use('/petModifiers', makePetModifiersRoutes(dbClient));
  app.use('/petActions', makePetActionsRoutes(dbClient));
  app.use('/pets', makePetsRoutes(dbClient));

  app.use(notFound);
  app.use(errorHandler);

  const host = config.get('appConfig.host') as string;
  const port = config.get('appConfig.port') as number;
  const server = app.listen(port, host, () => {
    if (process.env.NODE_ENV !== 'test') {
      console.log(`>>> SERVER RUNNING ON http://${host}:${port} <<<`);
    }
  });

  return server;
};

export default makeServer;
