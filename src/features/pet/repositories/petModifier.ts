import { DBClient } from '../../../database';
import { NewPetModifier } from '../models/petModifier';

export const makePetModifiersRepository = (dbClient: DBClient) => {
  const repository = {
    saveNewPetModifier: async (
      newPetModifier: NewPetModifier
    ): Promise<void> => {
      await dbClient.query(
        `
        INSERT INTO pet_modifiers (name, property, modifier)
        VALUES ($1, $2, $3)
      `,
        [newPetModifier.name, newPetModifier.property, newPetModifier.modifier]
      );
    },

    checkExistingIds: async (ids: number[]): Promise<number[]> => {
      const existingIds = (
        await dbClient.query(
          `
        SELECT p.id
        FROM pet_modifiers p
        WHERE p.id = ANY($1)
      `,
          [ids]
        )
      ).rows;

      return existingIds;
    },
  };

  return Object.freeze(repository);
};

export type PetModifiersRepository = ReturnType<
  typeof makePetModifiersRepository
>;
