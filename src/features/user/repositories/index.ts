import { DBClient } from '../../../database';
import { IUser } from '../models/user';

export const makeUsersRepository = (client: DBClient) => {
  const repository = {
    getUsers: async (): Promise<IUser[]> => {
      const users = await (
        await client.query<IUser>(
          `
          SELECT u.id, u.email, u.password, u.firstName, u.lastName 
          FROM users u
          `
        )
      ).rows;

      return users;
    },
  };

  return Object.freeze(repository);
};

export type UsersRepository = ReturnType<typeof makeUsersRepository>;
