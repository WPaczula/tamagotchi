import { PetTypesRepository } from '../repositories';
import { PetModifiersRepository } from '../repositories/petModifier';
import { RequestHandler } from 'express';
import { makeNewPetModifier } from '../models/petModifier';

export const makeCreatePetModifierHandler = (
  petModifiersRepository: PetModifiersRepository,
  petTypesRepository: PetTypesRepository
): RequestHandler => async (req, res, next) => {
  const { name, property, modifier } = req.body;

  try {
    const newPetModifier = await makeNewPetModifier(
      name,
      property,
      modifier,
      petTypesRepository
    );

    await petModifiersRepository.saveNewPetModifier(newPetModifier);

    res.status(201).end();
  } catch (error) {
    if (
      error.message.includes(
        'duplicate key value violates unique constraint "pet_modifier_index"'
      )
    ) {
      res.status(400);
      next(new Error('Pet modifier already exist'));
    }
    next(error);
  }
};
