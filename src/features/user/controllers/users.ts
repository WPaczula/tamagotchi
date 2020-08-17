import { UsersRepository } from '../repositories';
import { RequestHandler } from 'express';
import { makeUserDto } from '../dtos/user';

export const makeGetUsersHandler = (
  usersRepository: UsersRepository
): RequestHandler => async (req, res, next) => {
  try {
    const users = await (await usersRepository.getUsers()).map(makeUserDto);

    res.status(200).json(users);
  } catch (error) {
    next(error);
  }
};
