import joi from 'joi';
import { NewPetType } from '../models/petTypes';
import ValidationError from '../../../errors/validation';
import { pagingValidationSchema } from '../../../utils/paging';
import { Request } from 'express';
import { NewPetModifier } from '../models/petModifier';
import { PetTypesRepository } from '../repositories';

const newPetModifierSchema = joi.object({
  name: joi.string().trim().min(2).max(255).required(),
  property: joi.string().trim().min(2).max(255).required(),
  modifier: joi.number().min(1).required(),
});
export const validateNewPetModifier = async (
  newPetModifier: NewPetModifier,
  petTypeRepository: PetTypesRepository
): Promise<NewPetModifier> => {
  try {
    const value = await newPetModifierSchema.validateAsync(newPetModifier);

    const petPropertyExists = await petTypeRepository.checkIfPropertyExists(
      newPetModifier.property
    );
    if (!petPropertyExists) {
      throw new Error(`Pet property ${newPetModifier.property} doesn't exist`);
    }

    return value;
  } catch (error) {
    throw new ValidationError(error.message);
  }
};
