import { UsersRepository } from '../repositories';
import { RequestHandler } from 'express';
import { NewUserFactory } from '../models/auth';
import ValidationError from '../../../errors/validation';
import createHandler from '../../../utils/create-handler';

export const makeRegisterHandler = (
  usersRepository: UsersRepository,
  newUserFactory: NewUserFactory
): RequestHandler =>
  createHandler(async (req, res) => {
    const { email, password, firstName, lastName } = req.body;

    const userWithEmailExist = await usersRepository.checkIfEmailIsInUse(email);
    if (userWithEmailExist) {
      throw new ValidationError('email is already used.');
    }
    const user = await newUserFactory(email, password, firstName, lastName);

    await usersRepository.addUser(user);

    res.status(201).end();
  });

export const makeLoginHandler = (): RequestHandler => (req, res) => {
  res.status(204).end();
};
