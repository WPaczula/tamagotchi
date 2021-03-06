import { DBClient } from '../../../database';
import { NewPetAction, PetAction } from '../models/petAction';
import { findBy } from '../../../utils/find-by';

export const makePetActionsRepository = (dbClient: DBClient) => {
  const repository = {
    saveNewPetAction: async (newPetAction: NewPetAction): Promise<void> => {
      try {
        await dbClient.query('BEGIN');

        const { id } = (
          await dbClient.query(
            `
            INSERT INTO pet_actions (name, pet_type_id)
            VALUES ($1, $2)
            RETURNING id
            `,
            [newPetAction.name, newPetAction.petTypeId]
          )
        ).rows[0];

        await dbClient.query(
          `
              UPDATE pet_modifiers
              SET pet_action_id = $1
              WHERE id = ANY ($2)
              `,
          [id, newPetAction.petModifierIds]
        );
        await dbClient.query('COMMIT');
      } catch (error) {
        await dbClient.query('ROLLBACK');
        throw error;
      }
    },

    getAllPetActions: async (): Promise<PetAction[]> => {
      const petActions = (
        await dbClient.query(`
        SELECT pa.id, pa.pet_type_id as "petTypeId", pa.name, array_agg(pm.id) as "petModifierIds"
        FROM pet_actions pa
        JOIN pet_modifiers pm on pm.pet_action_id = pa.id
        GROUP BY pa.id, pa.pet_type_id, pa.name
      `)
      ).rows;

      return petActions;
    },

    findOne: async (
      opts: Partial<PetAction>
    ): Promise<PetAction | undefined> => {
      const petActions = await findBy(
        dbClient,
        opts,
        `
      SELECT pa.id, pa.pet_type_id as "petTypeId", pa.name, array_agg(pm.id) as "petModifierIds"
      FROM pet_actions pa
      JOIN pet_modifiers pm on pm.pet_action_id = pa.id
      `,
        'pa',
        'GROUP BY pa.id, pa.pet_type_id, pa.name'
      );

      if (petActions.length > 1) {
        throw new Error(
          `More than one action was found using criteria: ${JSON.stringify(
            opts
          )}`
        );
      }

      return petActions[0];
    },
  };

  return Object.freeze(repository);
};

export type PetActionsRepository = ReturnType<typeof makePetActionsRepository>;
