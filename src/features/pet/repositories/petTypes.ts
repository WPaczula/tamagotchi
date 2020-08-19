import { DBClient } from '../../../database';
import { NewPetType } from '../models/petTypes';

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
  };

  return Object.freeze(repository);
};

export type PetTypesRepository = ReturnType<typeof makePetTypesRepository>;
