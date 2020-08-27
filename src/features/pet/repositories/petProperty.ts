import { DBClient } from '../../../database';
import { PetPropertyValue, PetProperty } from '../models/petProperty';

export const makePetPropertiesRepository = (dbClient: DBClient) => {
  const repository = {
    getPropertyValues: async (petId: number): Promise<PetPropertyValue[]> => {
      const propertyValues = (
        await dbClient.query(
          `
        SELECT pv.id, pv.value, pv.pet_property_id as "petPropertyId", pv.pet_id as "petId", pv.updated_at as "updatedAt"
        FROM pet_property_values pv
        WHERE pv.pet_id = $1
      `,
          [petId]
        )
      ).rows.map(
        (p): PetPropertyValue => ({
          ...p,
          updatedAt: new Date(p.updatedAt),
        })
      );

      return propertyValues;
    },

    getProperties: async (petTypeId: number): Promise<PetProperty[]> => {
      const properties = (
        await dbClient.query(
          `
        SELECT pp.id, pp.name, pp.value, pp.weight, pp.value_per_time as "valuePerTime", pp.pet_type_id as "petTypeId"
        FROM pet_properties pp
        WHERE pp.pet_type_id = $1
      `,
          [petTypeId]
        )
      ).rows;

      return properties;
    },

    savePropertyValues: async (
      propertyValues: PetPropertyValue[]
    ): Promise<void> => {
      try {
        dbClient.query('BEGIN');

        propertyValues.forEach(async (pv) => {
          await dbClient.query(
            `
            UPDATE pet_property_values
            SET value = $1, updated_at = $2
            WHERE id = $3
          `,
            [pv.value, new Date(), pv.id]
          );
        });

        dbClient.query('COMMIT');
      } catch (e) {
        dbClient.query('ROLLBACK');
        throw e;
      }
    },
  };

  return Object.freeze(repository);
};

export type PetPropertiesRepository = ReturnType<
  typeof makePetPropertiesRepository
>;
