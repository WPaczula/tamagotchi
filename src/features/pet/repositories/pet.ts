import { DBClient } from '../../../database';
import { NewPet } from '../models/pet';

export const makePetsRepository = (dbClient: DBClient) => {
  const repository = {
    saveNewPet: async (newPet: NewPet): Promise<void> => {
      await dbClient.query(
        `
        INSERT INTO pets (name, pet_type_id, user_id)
        VALUES ($1, $2, $3)
      `,
        [newPet.name, newPet.petTypeId, newPet.userId]
      );
    },
  };

  return Object.freeze(repository);
};

export type PetsRepository = ReturnType<typeof makePetsRepository>;
