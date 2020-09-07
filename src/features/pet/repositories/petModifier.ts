import { DBClient } from '../../../database';
import { NewPetModifier, PetModifier } from '../models/petModifier';

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

    checkExistingIds: async function (ids: number[]): Promise<number[]> {
      return (await this.findByIds(ids)).map((m) => m.id);
    },

    findByIds: async (ids: number[]): Promise<PetModifier[]> => {
      const modifiers = (
        await dbClient.query(
          `
          SELECT p.id, p.name, p.property, p.modifier
          FROM pet_modifiers p
          WHERE p.id = ANY($1)
        `,
          [ids]
        )
      ).rows;

      return modifiers;
    },
  };

  return Object.freeze(repository);
};

export type PetModifiersRepository = ReturnType<
  typeof makePetModifiersRepository
>;
