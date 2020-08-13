import { validateNewUser } from '../validators';

export interface INewUser {
  readonly email: string;
  readonly password: string;
  readonly firstName?: string;
  readonly lastName?: string;
}

export const makeNewUser = async (
  email: string,
  password: string,
  firstName?: string,
  lastName?: string
): Promise<INewUser> => {
  const user = await validateNewUser({
    email,
    password,
    firstName,
    lastName,
  });

  return Object.freeze(user);
};
