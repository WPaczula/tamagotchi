import { UsersRepository } from '../repositories';
import { RequestHandler } from 'express';
import { makeUserDto } from '../dtos/user';
import { validateUserFilters } from '../validators';

export const makeGetUsersHandler = (
  usersRepository: UsersRepository
): RequestHandler => async (req, res, next) => {
  try {
    const { email, firstName, lastName } = await validateUserFilters(req);

    const users = (
      await usersRepository.find({
        email,
        firstName,
        lastName,
      })
    ).map(makeUserDto);

    res.status(200).json(users);
  } catch (error) {
    next(error);
  }
};
