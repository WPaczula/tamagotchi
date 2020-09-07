import { PetTypesRepository } from '../repositories';
import { PetModifiersRepository } from '../repositories/petModifier';
import { RequestHandler } from 'express';
import { makeNewPetModifier } from '../models/petModifier';
import createHandler from '../../../utils/create-handler';

export const makeCreatePetModifierHandler = (
  petModifiersRepository: PetModifiersRepository,
  petTypesRepository: PetTypesRepository
): RequestHandler =>
  createHandler(async (req, res) => {
    const { name, property, modifier } = req.body;

    try {
      const newPetModifier = await makeNewPetModifier(name, property, modifier);

      const petPropertyExists = await petTypesRepository.checkIfPropertyExists(
        newPetModifier.property
      );
      if (!petPropertyExists) {
        res.status(404);
        throw new Error(
          `Pet property ${newPetModifier.property} doesn't exist`
        );
      }

      await petModifiersRepository.saveNewPetModifier(newPetModifier);

      res.status(201).end();
    } catch (error) {
      if (
        error.message.includes(
          'duplicate key value violates unique constraint "pet_modifier_index"'
        )
      ) {
        res.status(400);
        throw new Error('Pet modifier already exist');
      }

      throw error;
    }
  });
