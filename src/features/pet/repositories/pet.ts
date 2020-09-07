import { DBClient } from '../../../database';
import { NewPet, Pet } from '../models/pet';
import { findBy } from '../../../utils/find-by';

export const makePetsRepository = (dbClient: DBClient) => {
  const repository = {
    saveNewPet: async (newPet: NewPet): Promise<void> => {
      try {
        await dbClient.query('BEGIN');
        const { petId } = (
          await dbClient.query(
            `
          INSERT INTO pets (name, pet_type_id, user_id)
          VALUES ($1, $2, $3)
          RETURNING id as "petId"
          `,
            [newPet.name, newPet.petTypeId, newPet.userId]
          )
        ).rows[0];

        const petPropertyValues = (
          await dbClient.query(
            `
          SELECT pp.id as "petPropertyId", pp.value
          FROM pet_properties pp
          WHERE pp.pet_type_id = $1
        `,
            [newPet.petTypeId]
          )
        ).rows;

        for (const { petPropertyId, value } of petPropertyValues) {
          await dbClient.query(
            `
            INSERT INTO pet_property_values (value, pet_property_id, pet_id, updated_at)
            VALUES ($1, $2, $3, $4)
            `,
            [value, petPropertyId, petId, new Date()]
          );
        }

        await dbClient.query('COMMIT');
      } catch (error) {
        await dbClient.query('ROLLBACK');
        throw error;
      }
    },

    findOne: async (petOptions: Partial<Pet>): Promise<Pet | undefined> => {
      const pet = (
        await findBy(
          dbClient,
          petOptions,
          `
        SELECT p.id, p.name, p.pet_type_id as "petTypeId", p.user_id as "userId"
        FROM pets p
      `,
          'p'
        )
      )[0];

      return pet;
    },
  };

  return Object.freeze(repository);
};

export type PetsRepository = ReturnType<typeof makePetsRepository>;
