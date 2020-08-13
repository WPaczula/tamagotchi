import { validateNewUser } from '../validators';
import { HashFunction } from '../utils/hash';

export interface INewUser {
  readonly email: string;
  readonly password: string;
  readonly firstName?: string;
  readonly lastName?: string;
}

export const makeNewUserFactory = (hash: HashFunction) => async (
  email: string,
  password: string,
  firstName?: string,
  lastName?: string
): Promise<INewUser> => {
  const userData = await validateNewUser({
    email,
    password,
    firstName,
    lastName,
  });

  const hashedPassword = await hash(password);

  const user = {
    ...userData,
    password: hashedPassword,
  };

  return Object.freeze(user);
};
export type NewUserFactory = ReturnType<typeof makeNewUserFactory>;
