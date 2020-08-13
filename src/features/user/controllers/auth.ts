import { UsersRepository } from '../repositories';
import { RequestHandler } from 'express';
import { NewUserFactory } from '../models/auth';
import ValidationError from '../../../errors/validation';

export const makeRegisterHandler = (
  usersRepository: UsersRepository,
  newUserFactory: NewUserFactory
): RequestHandler => async (req, res, next) => {
  try {
    const { email, password, firstName, lastName } = req.body;

    const userWithEmailExist = await usersRepository.checkIfEmailIsInUse(email);
    if (userWithEmailExist) {
      throw new ValidationError('email is already used.');
    }
    const user = await newUserFactory(email, password, firstName, lastName);

    res.status(200).json(user);
  } catch (error) {
    next(error);
  }
};
