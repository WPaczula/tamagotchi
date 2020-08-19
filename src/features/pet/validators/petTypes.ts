import joi from 'joi';
import { NewPetType } from '../models/petTypes';
import ValidationError from '../../../errors/validation';
import { pagingValidationSchema } from '../../../utils/paging';
import { Request } from 'express';

const newPetTypeSchema = joi.object({
  name: joi.string().trim().min(2).max(255).required(),
});
export const validateNewPetType = async (
  newPetType: NewPetType
): Promise<NewPetType> => {
  try {
    const value = await newPetTypeSchema.validateAsync(newPetType);

    return value;
  } catch (error) {
    throw new ValidationError(error.message);
  }
};

const getPetTypesSchema = joi.object().concat(pagingValidationSchema);
export const validateGetPetTypes = async (req: Request) => {
  try {
    const { page, pageSize } = await getPetTypesSchema.validateAsync(req.query);

    return { page, pageSize };
  } catch (error) {
    throw new ValidationError(error.message);
  }
};
