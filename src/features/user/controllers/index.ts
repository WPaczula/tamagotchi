import { UsersRepository } from '../repositories';
import { RequestHandler } from 'express';

export const makeGetUsersHandler = (
  usersRepository: UsersRepository
): RequestHandler => async (req, res, next) => {
  try {
    const users = await usersRepository.getUsers();

    res.status(200).json(users);
  } catch (error) {
    next(error);
  }
};
