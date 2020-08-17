import { DBClient } from '../../../database';
import { User } from '../models/user';
import { NewUser } from '../models/auth';

export const makeUsersRepository = (client: DBClient) => {
  const repository = {
    getUsers: async (): Promise<User[]> => {
      const users = (
        await client.query<User>(`
          SELECT u.id, u.email, u.password, u.firstName as "firstName", u.lastName as "lastName" 
          FROM users u
        `)
      ).rows;

      return users;
    },

    checkIfEmailIsInUse: async (email: string): Promise<boolean> => {
      const isEmailInUse =
        (
          await client.query<User>(
            `
            SELECT 1
              FROM users u
              WHERE u.email = $1
            `,
            [email]
          )
        ).rowCount > 0;

      return isEmailInUse;
    },

    addUser: async (user: NewUser): Promise<void> => {
      await client.query(
        `
        INSERT INTO users (email, password, lastName, firstName) 
        VALUES ($1, $2, $3, $4);
        `,
        [user.email, user.password, user.lastName, user.firstName]
      );
    },

    find: async function (user: Partial<User> = {}): Promise<User[]> {
      const predicateFields = (Object.keys(user) as (keyof User)[]).filter(
        (field) => typeof user[field] !== 'undefined'
      );
      const predicateValues = predicateFields.map((field) => user[field]);

      if (predicateFields.length === 0) {
        return this.getUsers();
      }

      let sql = `
      SELECT u.id, u.email, u.password, u.firstName as "firstName", u.lastName as "lastName" 
      FROM users u
      WHERE `;
      // build the predicate
      predicateFields.forEach((field, i) => {
        const isLast = i === predicateFields.length - 1;
        sql = sql + `u.${field}=$${i + 1}`;
        sql = sql + (isLast ? ';' : ' and ');
      });

      const users = (await client.query(sql, predicateValues)).rows;

      return users;
    },

    findOne: async function (user: Partial<User>): Promise<User> {
      const users = await this.find(user);

      if (users.length > 1) {
        throw new Error('Expected single user but found multiple entries');
      }

      return users[0];
    },
  };

  return Object.freeze(repository);
};

export type UsersRepository = ReturnType<typeof makeUsersRepository>;
