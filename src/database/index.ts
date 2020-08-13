import { Client } from 'pg';
import config from 'config';

export type DBClient = Pick<Client, 'query'>;

const initDBClient = async () => {
  const client = new Client(config.get('dbConfig'));
  await client.connect();
  return client;
};

export default initDBClient;
