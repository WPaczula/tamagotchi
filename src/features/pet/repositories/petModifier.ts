import { DBClient } from '../../../database';
import { NewPetModifier } from '../models/petModifier';

export const makePetModifiersRepository = (dbClient: DBClient) => {
  const repository = {
    saveNewPetModifier: async function (
      newPetModifier: NewPetModifier
    ): Promise<void> {
      await dbClient.query(
        `
        INSERT INTO pet_modifiers (name, property, modifier)
        VALUES ($1, $2, $3)
      `,
        [newPetModifier.name, newPetModifier.property, newPetModifier.modifier]
      );
    },
  };

  return Object.freeze(repository);
};

export type PetModifiersRepository = ReturnType<
  typeof makePetModifiersRepository
>;
