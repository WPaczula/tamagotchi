import initDBClient from './database';
import config from 'config';
import express from 'express';
import morgan from 'morgan';
import helmet from 'helmet';
import cors from 'cors';

const app = express();

// apply middlewares
app.use(express.urlencoded({ extended: true }));
app.use(morgan('common'));
app.use(helmet());
app.use(cors());

// add routes
app.get('/', (req, res) => {
  res.json({ message: 'hello world' });
});

const init = async () => {
  try {
    await initDBClient();

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
