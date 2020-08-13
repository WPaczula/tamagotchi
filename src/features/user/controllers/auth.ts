import { UsersRepository } from '../repositories';
import { RequestHandler } from 'express';
import { makeNewUser } from '../models/auth';
import ValidationError from '../../../errors/validation';

export const makeRegisterHandler = (
  usersRepository: UsersRepository
): RequestHandler => async (req, res, next) => {
  try {
    const { email, password, firstName, lastName } = req.body;

    const userWithEmailExist = await usersRepository.checkIfEmailIsInUse(email);
    if (userWithEmailExist) {
      throw new ValidationError('email is already used.');
    }

    const user = await makeNewUser(email, password, firstName, lastName);

    res.status(200).send('Register');
  } catch (error) {
    console.log(error);
    next(error);
  }
};
