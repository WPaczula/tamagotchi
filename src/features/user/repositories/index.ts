import { DBClient } from '../../../database';
import { IUser } from '../models/user';
import { INewUser } from '../models/auth';

export const makeUsersRepository = (client: DBClient) => {
  const repository = {
    getUsers: async (): Promise<IUser[]> => {
      const users = (
        await client.query<IUser>(`
          SELECT u.id, u.email, u.password, u.firstName, u.lastName 
          FROM users u
        `)
      ).rows;

      return users;
    },

    checkIfEmailIsInUse: async (email: string): Promise<boolean> => {
      const isEmailInUse =
        (
          await client.query<IUser>(
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

    addUser: async (user: INewUser): Promise<void> => {
      await client.query(
        `
        INSERT INTO users (email, password, lastName, firstName) 
        VALUES ($1, $2, $3, $4);
        `,
        [user.email, user.password, user.lastName, user.firstName]
      );
    },
  };

  return Object.freeze(repository);
};

export type UsersRepository = ReturnType<typeof makeUsersRepository>;
