import joi from 'joi';
import { NewPetType } from '../models/petTypes';
import ValidationError from '../../../errors/validation';

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
