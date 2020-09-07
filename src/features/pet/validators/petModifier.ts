import joi from 'joi';
import ValidationError from '../../../errors/validation';
import { NewPetModifier } from '../models/petModifier';

const newPetModifierSchema = joi.object({
  name: joi.string().trim().min(2).max(255).required(),
  property: joi.string().trim().min(2).max(255).required(),
  modifier: joi.number().min(1).required(),
});
export const validateNewPetModifier = async (
  newPetModifier: NewPetModifier
): Promise<NewPetModifier> => {
  try {
    return await newPetModifierSchema.validateAsync(newPetModifier);
  } catch (error) {
    throw new ValidationError(error.message);
  }
};
