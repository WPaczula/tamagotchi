import { UsersRepository } from '../repositories';
import { RequestHandler } from 'express';
import { makeUserDto } from '../dtos/user';
import {
  validateGetUsersRequest,
  validateUserParams,
  validateUser,
} from '../validators';
import { makePagedResult } from '../../../utils/paging';
import { getCurrentUrl } from '../../../utils/url';
import jsonPatch from 'fast-json-patch';
import { HashFunction } from '../utils/hash';
import createHandler from '../../../utils/create-handler';

export const makeGetUsersHandler = (
  usersRepository: UsersRepository
): RequestHandler =>
  createHandler(async (req, res) => {
    const {
      email,
      firstName,
      lastName,
      page,
      pageSize,
    } = await validateGetUsersRequest(req);

    const users = (
      await usersRepository.find({
        email,
        firstName,
        lastName,
      })
    ).map(makeUserDto);

    res
      .status(200)
      .json(makePagedResult(users, { page, pageSize }, getCurrentUrl(req)));
  });

export const makeUpdateUserHandler = (
  usersRepository: UsersRepository,
  hash: HashFunction
): RequestHandler =>
  createHandler(async (req, res) => {
    const id = await validateUserParams(req);

    const user = await usersRepository.findOne({ id });
    if (!user) {
      res.status(404);
      throw new Error('User does not exist');
    }

    let updatedUser = jsonPatch.applyPatch(user, req.body, true, false)
      .newDocument;
    if (updatedUser === undefined) {
      res.status(400);
      throw new Error('Invalid query');
    }

    const userAlreadyExist = await usersRepository.checkIfEmailIsInUse(
      updatedUser.email
    );
    if (userAlreadyExist) {
      res.status(409);
      throw new Error('Email already in use');
    }

    if (updatedUser.password !== user.password) {
      updatedUser = {
        ...updatedUser,
        password: await hash(updatedUser.password),
      };
    }

    updatedUser = await validateUser(id, updatedUser);
    await usersRepository.updateUser(updatedUser);

    res.status(204).end();
  });

export const makeDeleteUserHandler = (
  usersRepository: UsersRepository
): RequestHandler =>
  createHandler(async (req, res) => {
    const id = await validateUserParams(req);

    const user = await usersRepository.findOne({
      id,
    });
    if (!user) {
      res.status(404);
      throw new Error('User does not exist');
    }

    await usersRepository.deleteUser(id);

    res.status(204).end();
  });
