import { User } from '../../features/user/models/user';
import { UserDto } from '../../features/user/dtos/user';

export const makeUser = (opts: Partial<User> = {}): User => {
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

export const makeUserDto = (opts: Partial<UserDto> = {}): UserDto => {
  const {
    id = 0,
    email = 'test@test.com',
    firstName = 'bob',
    lastName = 'smith',
  } = opts;

  return Object.freeze({
    id,
    email,
    firstName,
    lastName,
  });
};
