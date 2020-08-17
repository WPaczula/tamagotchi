import { DBClient } from '../../../database';
import { User } from '../models/user';
import { NewUser } from '../models/auth';

export const makeUsersRepository = (client: DBClient) => {
  const repository = {
    getUsers: async (): Promise<User[]> => {
      const users = (
        await client.query<User>(`
          SELECT u.id, u.email, u.password, u.firstName, u.lastName 
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

    findOne: async <T>(field: keyof User, value: T): Promise<User> => {
      const user = (
        await client.query(
          `
        SELECT u.id, u.email, u.password, u.firstName, u.lastName 
        FROM users u
        WHERE u.${field} = $1
      `,
          [value]
        )
      ).rows[0];

      return user;
    },
  };

  return Object.freeze(repository);
};

export type UsersRepository = ReturnType<typeof makeUsersRepository>;
