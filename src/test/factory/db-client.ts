import { DBClient } from '../../database';
import { QueryArrayResult } from 'pg';

type DBClientOptions<T> = {
  queryRows?: T[];
};

const makeDBClient = <T>({
  queryRows = [],
}: DBClientOptions<T> = {}): DBClient => {
  const query = () =>
    Promise.resolve({
      rows: queryRows,
      rowCount: queryRows.length,
    } as QueryArrayResult<any>);

  return {
    query,
  } as DBClient;
};

export default makeDBClient;
