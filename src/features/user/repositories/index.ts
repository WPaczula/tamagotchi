import { DBClient } from '../../../database';
import { IUser } from '../models/user';

export const makeUsersRepository = (client: DBClient) => {
  const repository = {
    getUsers: async (): Promise<IUser[]> => {
      const users = (
        await client.query<IUser>(
          `SELECT u.id, u.email, u.password, u.firstName, u.lastName 
          FROM users u`
        )
      ).rows;

      return users;
    },

    checkIfEmailIsInUse: async (email: string): Promise<boolean> => {
      const isEmailInUse =
        (
          await client.query<IUser>(
            `SELECT 1
              FROM users u
              WHERE u.email = $1`,
            [email]
          )
        ).rowCount > 0;

      return isEmailInUse;
    },
  };

  return Object.freeze(repository);
};

export type UsersRepository = ReturnType<typeof makeUsersRepository>;
