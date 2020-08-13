import initDBClient from './database';
import config from 'config';
import express from 'express';
import morgan from 'morgan';
import helmet from 'helmet';
import cors from 'cors';
import { errorHandler, notFound } from './middlewares';
import makeUsersRoutes from './features/user/routes';

const init = async () => {
  try {
    const app = express();
    const client = await initDBClient();

    // apply middlewares
    app.use(express.urlencoded({ extended: true }));
    app.use(morgan('common'));
    app.use(helmet());
    app.use(cors());

    // add routes
    app.get('/', (req, res) => {
      res.json({ message: 'hello world' });
    });
    app.use('/users', makeUsersRoutes(client));

    app.use(notFound);
    app.use(errorHandler);

    const host = config.get('appConfig.host') as string;
    const port = config.get('appConfig.port') as number;
    app.listen(port, host, () => {
      console.log(`>>> SERVER RUNNING ON http://${host}:${port} <<<`);
    });
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

init();
