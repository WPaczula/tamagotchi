import { UsersRepository } from '../repositories';
import { RequestHandler } from 'express';
import { makeUserDto } from '../dtos/user';
import { validateGetUsersRequest } from '../validators';
import { makePagedResult } from '../../../utils/paging';
import { getCurrentUrl } from '../../../utils/url';

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
