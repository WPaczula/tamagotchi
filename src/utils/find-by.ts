import { DBClient } from '../database';
import { group } from 'console';

export const findBy = async <T>(
  dbClient: DBClient,
  queryOptions: Partial<T>,
  getAllSql: string,
  predicateTablePrefix: string,
  grouping?: string
) => {
  const predicateFields = (Object.keys(queryOptions) as (keyof T)[]).filter(
    (field) => typeof queryOptions[field] !== 'undefined'
  );
  const predicateValues = predicateFields.map((field) => queryOptions[field]);

  if (predicateFields.length === 0) {
    let sql = getAllSql;

    if (grouping) {
      sql = `${sql}
      ${grouping}`;
    }

    return (await dbClient.query(sql)).rows;
  }

  let sql = `
  ${getAllSql}
  WHERE `;
  // build the predicate
  predicateFields.forEach((field, i) => {
    const isLast = i === predicateFields.length - 1;

    sql = sql + `${predicateTablePrefix}.${field}=$${i + 1}`;

    if (!isLast) {
      sql = sql + ' and ';
    }
  });

  if (grouping) {
    sql = `${sql}
    ${grouping}`;
  }

  const results = (await dbClient.query(sql, predicateValues)).rows as T[];

  return results;
};
