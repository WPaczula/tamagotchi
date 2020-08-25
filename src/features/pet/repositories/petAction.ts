import { DBClient } from '../../../database';
import { NewPetAction, PetAction } from '../models/petAction';

export const makePetActionsRepository = (dbClient: DBClient) => {
  const repository = {
    saveNewPetAction: async (newPetAction: NewPetAction): Promise<void> => {
      await dbClient.query(
        `
        INSERT INTO pet_actions (name, pet_type_id, pet_modifier_ids)
        VALUES ($1, $2, $3)
      `,
        [newPetAction.name, newPetAction.petTypeId, newPetAction.petModifierIds]
      );
    },

    getAllPetActions: async (): Promise<PetAction[]> => {
      const petActions = (
        await dbClient.query(`
        SELECT p.id, p.pet_type_id as "petTypeId", p.name, p.pet_modifier_ids as "petModifierIds"
        FROM pet_actions p
      `)
      ).rows;

      return petActions;
    },
  };

  return Object.freeze(repository);
};

export type PetActionsRepository = ReturnType<typeof makePetActionsRepository>;
