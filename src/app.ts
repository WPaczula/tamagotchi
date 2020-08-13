import { DBClient } from './database';
import config from 'config';
import express from 'express';
import morgan from 'morgan';
import helmet from 'helmet';
import cors from 'cors';
import { errorHandler, notFound } from './middlewares';
import { makeUsersRoutes, makeAuthRoutes } from './features/user/routes';
import initializeSwagger from './utils/initialize-swagger';

const makeServer = async (dbClient: DBClient) => {
  const app = express();

  initializeSwagger(app);

  // apply middlewares
  app.use(express.json());
  app.use(morgan('common'));
  app.use(helmet());
  app.use(cors());

  // add routes
  app.get('/', (req, res) => {
    res.json({ message: 'hello world' });
  });
  app.use('/', makeAuthRoutes(dbClient));
  app.use('/users', makeUsersRoutes(dbClient));

  app.use(notFound);
  app.use(errorHandler);

  const host = config.get('appConfig.host') as string;
  const port = config.get('appConfig.port') as number;
  const server = app.listen(port, host, () => {
    console.log(`>>> SERVER RUNNING ON http://${host}:${port} <<<`);
  });

  return server;
};

export default makeServer;
