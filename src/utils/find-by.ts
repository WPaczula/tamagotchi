import { DBClient } from '../database';

export const findBy = async <T>(
  dbClient: DBClient,
  queryOptions: Partial<T>,
  getAllSql: string,
  predicateTablePrefix: string
) => {
  const predicateFields = (Object.keys(queryOptions) as (keyof T)[]).filter(
    (field) => typeof queryOptions[field] !== 'undefined'
  );
  const predicateValues = predicateFields.map((field) => queryOptions[field]);

  if (predicateFields.length === 0) {
    return (await dbClient.query(getAllSql)).rows;
  }

  let sql = `
  ${getAllSql}
  WHERE `;
  // build the predicate
  predicateFields.forEach((field, i) => {
    const isLast = i === predicateFields.length - 1;
    sql = sql + `${predicateTablePrefix}.${field}=$${i + 1}`;
    sql = sql + (isLast ? ';' : ' and ');
  });

  const results = (await dbClient.query(sql, predicateValues)).rows as T[];

  return results;
};
