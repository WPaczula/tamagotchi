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

export const makeGetUsersHandler = (
  usersRepository: UsersRepository
): RequestHandler => async (req, res, next) => {
  try {
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
  } catch (error) {
    next(error);
  }
};

export const makeUpdateUserHandler = (
  usersRepository: UsersRepository,
  hash: HashFunction
): RequestHandler => async (req, res, next) => {
  try {
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

    if (updatedUser.password !== user.password) {
      updatedUser = {
        ...updatedUser,
        password: await hash(updatedUser.password),
      };
    }

    updatedUser = await validateUser(id, updatedUser);
    usersRepository.updateUser(updatedUser);

    res.status(204).end();
  } catch (error) {
    next(error);
  }
};

export const makeDeleteUserHandler = (
  usersRepository: UsersRepository
): RequestHandler => async (req, res, next) => {
  try {
    const id = await validateUserParams(req);

    const user = await usersRepository.findOne({
      id,
    });
    if (!user) {
      res.status(404);
      throw new Error('User does not exist');
    }

    usersRepository.deleteUser(id);

    res.status(204).end();
  } catch (error) {
    next(error);
  }
};
