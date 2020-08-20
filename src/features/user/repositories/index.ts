import { DBClient } from '../../../database';
import { User } from '../models/user';
import { NewUser } from '../models/auth';
import { findBy } from '../../../utils/find-by';

export const makeUsersRepository = (client: DBClient) => {
  const repository = {
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
        INSERT INTO users (email, password, last_name, first_name) 
        VALUES ($1, $2, $3, $4);
        `,
        [user.email, user.password, user.lastName, user.firstName]
      );
    },

    find: async function (user: Partial<User> = {}): Promise<User[]> {
      const users = findBy(
        client,
        user,
        `
        SELECT u.id, u.email, u.password, u.first_name as "firstName", u.last_name as "lastName" 
        FROM users u
        `,
        'u'
      );
      return users;
    },

    findOne: async function (user: Partial<User>): Promise<User | undefined> {
      const users = await this.find(user);

      if (users.length > 1) {
        throw new Error('Expected single user but found multiple entries');
      }

      return Object.freeze(users[0]);
    },

    updateUser: async (user: User): Promise<void> => {
      await client.query(
        `
        UPDATE users
        SET email = $1, password = $2, firstName = $3, lastName = $4
        WHERE id = $5
      `,
        [user.email, user.password, user.firstName, user.lastName, user.id]
      );
    },

    deleteUser: async (id: number): Promise<void> => {
      await client.query(
        `
          DELETE FROM users u
          WHERE u.id = $1
        `,
        [id]
      );
    },
  };

  return Object.freeze(repository);
};

export type UsersRepository = ReturnType<typeof makeUsersRepository>;
