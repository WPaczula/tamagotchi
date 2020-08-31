import joi from 'joi';
import ValidationError from '../../../errors/validation';
import { NewPet } from '../models/pet';
import { Request } from 'express';

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

const petIdSchema = joi.object({
  id: joi.number().min(1).required(),
});
export const validatePetId = async (request: Request): Promise<number> => {
  try {
    const value = await petIdSchema.validateAsync(request.params);

    return value.id;
  } catch (error) {
    throw new ValidationError(error.message);
  }
};

const applyActionSchema = joi.object({
  petId: joi.number().min(1).required(),
  actionId: joi.number().min(1).required(),
});
export const validateApplyActionRequest = async (
  request: Request
): Promise<{ petId: number; actionId: number }> => {
  try {
    const value = await applyActionSchema.validateAsync(request.params);

    return value;
  } catch (error) {
    throw new ValidationError(error.message);
  }
};
