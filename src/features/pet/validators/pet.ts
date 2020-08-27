import joi from 'joi';
import ValidationError from '../../../errors/validation';
import { NewPet } from '../models/pet';

const newPetSchema = joi.object({
  name: joi.string().trim().min(2).max(255).required(),
  petTypeId: joi.number().min(1).required(),
  userId: joi.number().min(1).required(),
});
export const validateNewPet = async (newPetAction: NewPet): Promise<NewPet> => {
  try {
    const value = await newPetSchema.validateAsync(newPetAction);

    return value;
  } catch (error) {
    throw new ValidationError(error.message);
  }
};
