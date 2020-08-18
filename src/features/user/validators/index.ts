import joi from 'joi';
import { NewUser } from '../models/auth';
import ValidationError from '../../../errors/validation';
import { Request } from 'express';
import { UserFilters, User } from '../models/user';
import { pagingValidationSchema, PagingOptions } from '../../../utils/paging';

const newUserValidationSchema = joi.object<NewUser>({
  email: joi.string().email().max(255).required(),
  password: joi.string().required().min(7).max(255),
  firstName: joi.string().min(2).max(255).optional().allow(null),
  lastName: joi.string().min(2).max(255).optional().allow(null),
});
export const validateNewUser = async (user: NewUser): Promise<NewUser> => {
  try {
    const value = await newUserValidationSchema.validateAsync(user);
    return value;
  } catch (error) {
    throw new ValidationError(error.message);
  }
};

const userValidationSchema = joi
  .object({
    id: joi.number().min(0).required(),
  })
  .concat(newUserValidationSchema);
export const validateUser = async (id: number, user: User): Promise<User> => {
  try {
    const value = await userValidationSchema.validateAsync(user);

    if (value.id !== id) {
      throw new Error('Id update is not allowed.');
    }

    return value;
  } catch (error) {
    throw new ValidationError(error.message);
  }
};

const getUsersValidationSchema = joi
  .object({
    email: joi.string().email().max(255).optional(),
    firstName: joi.string().min(2).max(255).optional(),
    lastName: joi.string().min(2).max(255).optional(),
  })
  .concat(pagingValidationSchema);
export const validateGetUsersRequest = async (
  req: Request
): Promise<UserFilters & PagingOptions> => {
  try {
    await getUsersValidationSchema.validateAsync(req.query);

    const { email, firstName, lastName, page, pageSize } = req.query;
    return {
      email: email as string | undefined,
      firstName: firstName as string | undefined,
      lastName: lastName as string | undefined,
      page: parseInt(page as string),
      pageSize: parseInt(pageSize as string),
    };
  } catch (error) {
    throw new ValidationError(error.message);
  }
};

const userParamValidationSchema = joi.object({
  id: joi.number().min(0).required(),
});
export const validateUserParams = async (req: Request): Promise<number> => {
  try {
    await userParamValidationSchema.validateAsync(req.params);
    const { id } = req.params;
    return parseInt(id);
  } catch (error) {
    throw new ValidationError(error.message);
  }
};
