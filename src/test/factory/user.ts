import { User } from '../../features/user/models/user';
import { UserDto } from '../../features/user/dtos/user';
import { UsersRepository } from '../../features/user/repositories';
import { stub } from 'sinon';
import { DBClient } from '../../database';

export const makeUser = (opts: Partial<User> = {}): User => {
  const {
    id = 0,
    email = 'test@test.com',
    firstName = 'bob',
    lastName = 'smith',
    password = 'hash912580985210uf90sa0ufu9weqj90j9021j90j',
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

export const makeFakeUsersRepositoryFactory = (
  opts: Partial<UsersRepository> = {}
) => {
  const {
    addUser = stub().returns(Promise.resolve()),
    checkIfEmailIsInUse = stub().returns(Promise.resolve(false)),
    find = stub().returns(Promise.resolve([])),
    findOne = stub().returns(Promise.resolve()),
    updateUser = stub().returns(Promise.resolve()),
    deleteUser = stub().returns(Promise.resolve()),
  } = opts;

  return (dbClient: DBClient): UsersRepository => ({
    addUser,
    checkIfEmailIsInUse,
    find,
    findOne,
    updateUser,
    deleteUser,
  });
};
