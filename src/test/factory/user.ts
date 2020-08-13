import { IUser } from '../../features/user/models/user';

export const makeUser = (opts: Partial<IUser> = {}): IUser => {
  const {
    id = 0,
    email = 'test@test.com',
    firstName = 'bob',
    lastName = 'smith',
    password = 'hash',
  } = opts;

  return Object.freeze({
    id,
    email,
    firstName,
    lastName,
    password,
  });
};
