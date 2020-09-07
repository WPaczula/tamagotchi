import joi from 'joi';
import ValidationError from '../../../errors/validation';
import { NewPetAction } from '../models/petAction';

const newPetActionSchema = joi.object({
  name: joi.string().trim().min(2).max(255).required(),
  petTypeId: joi.number().min(1).required(),
  petModifierIds: joi
    .array()
    .items(joi.number().min(1).required())
    .min(1)
    .required(),
});
export const validateNewPetAction = async (
  newPetAction: NewPetAction
): Promise<NewPetAction> => {
  try {
    return await newPetActionSchema.validateAsync(newPetAction);
  } catch (error) {
    throw new ValidationError(error.message);
  }
};
