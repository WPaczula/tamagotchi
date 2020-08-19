import { DBClient } from '../../../database';
import { NewPetType, PetType } from '../models/petTypes';

export const makePetTypesRepository = (dbClient: DBClient) => {
  const repository = {
    createPetType: async (newPetType: NewPetType): Promise<void> => {
      await dbClient.query(
        `
        INSERT INTO petTypes (name)
        VALUES ($1)
      `,
        [newPetType.name]
      );
    },

    getPetTypes: async (): Promise<PetType[]> => {
      const petTypes = (
        await dbClient.query(`
        SELECT p.id, p.name
        FROM petTypes p
      `)
      ).rows;

      return petTypes;
    },
  };

  return Object.freeze(repository);
};

export type PetTypesRepository = ReturnType<typeof makePetTypesRepository>;
