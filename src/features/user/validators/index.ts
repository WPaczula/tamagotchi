import joi from 'joi';
import { NewUser } from '../models/auth';
import ValidationError from '../../../errors/validation';
import { Request } from 'express';
import { UserFilters } from '../models/user';

const newUserValidationSchema = joi.object<NewUser>({
  email: joi.string().email().max(255).required(),
  password: joi.string().required().min(7).max(255),
  firstName: joi.string().min(2).max(255).optional(),
  lastName: joi.string().min(2).max(255).optional(),
});

export const validateNewUser = async (user: NewUser): Promise<NewUser> => {
  try {
    const value = await newUserValidationSchema.validateAsync(user);
    return value;
  } catch (error) {
    throw new ValidationError(error.message);
  }
};

const userFiltersValidationSchema = joi.object<UserFilters>({
  email: joi.string().email().max(255).optional(),
  firstName: joi.string().min(2).max(255).optional(),
  lastName: joi.string().min(2).max(255).optional(),
});
export const validateUserFilters = async (
  req: Request
): Promise<UserFilters> => {
  try {
    await userFiltersValidationSchema.validateAsync(req.query);

    const { email, firstName, lastName } = req.query;
    return {
      email: email as string | undefined,
      firstName: firstName as string | undefined,
      lastName: lastName as string | undefined,
    };
  } catch (error) {
    throw new ValidationError(error.message);
  }
};
