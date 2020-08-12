import { Client } from 'pg';
import config from 'config';

const initDBClient = async () => {
  const client = new Client(config.get('dbConfig'));

  await client.connect();
};

export default initDBClient;
