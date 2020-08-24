import { DBClient } from '../../../database';
import {
  NewPetType,
  PetType,
  PetTypeWithPropertyArray,
} from '../models/petTypes';
import { findBy } from '../../../utils/find-by';
import { PetProperty } from '../models/petProperty';

export const makePetTypesRepository = (dbClient: DBClient) => {
  const repository = {
    createPetType: async (newPetType: NewPetType): Promise<void> => {
      try {
        await dbClient.query('BEGIN');
        const numberOfProperties = 5;
        const { id } = (
          await dbClient.query(
            `
              INSERT INTO pet_types (name)
              VALUES ($1)
              RETURNING id;
            `,
            [newPetType.name]
          )
        ).rows[0];

        const valuesTemplateString = newPetType.properties.map(
          (_, i) =>
            `(
            $${1 + i * numberOfProperties}, 
            $${2 + i * numberOfProperties}, 
            $${3 + i * numberOfProperties}, 
            $${4 + i * numberOfProperties}, 
            $${5 + i * numberOfProperties}
            )`
        );
        await dbClient.query(
          `
            INSERT INTO pet_properties (name, value, weight, value_per_time, pet_type_id)
            VALUES ${valuesTemplateString};
          `,
          newPetType.properties.flatMap((p) => [
            p.name,
            p.value,
            p.weight,
            p.valuePerTime,
            id,
          ])
        );
        await dbClient.query('COMMIT');
      } catch (error) {
        await dbClient.query('ROLLBACK');
        throw error;
      }
    },

    find: async (petType: Partial<PetType> = {}): Promise<PetType[]> => {
      const petTypesWithPropertyArrays = (await findBy(
        dbClient,
        petType,
        `
          SELECT 
            pt.id, 
            pt.name, 
            array_agg(pp.id) as ids, 
            array_agg(pp.name) as names, 
            array_agg(pp.value) as values, 
            array_agg(pp.weight) as weights, 
            array_agg(pp.value_per_time) as "valuesPerTime"  
          FROM pet_types pt JOIN pet_properties pp on pt.id = pp.pet_type_id
        `,
        'pt',
        'GROUP BY pt.id, pt.name'
      )) as PetTypeWithPropertyArray[];

      const petTypes: PetType[] = petTypesWithPropertyArrays.map((p) => {
        const properties: PetProperty[] = [];
        for (let i = 0; i < p.ids.length; i++) {
          properties.push({
            id: p.ids[i],
            name: p.names[i],
            value: p.values[i],
            weight: p.weights[i],
            valuePerTime: p.valuesPerTime[i],
          });
        }

        return {
          id: p.id,
          name: p.name,
          properties,
        };
      });

      return petTypes;
    },

    findOne: async function (petType: Partial<PetType>): Promise<PetType> {
      const petTypes = await this.find(petType);

      if (petTypes.length > 1) {
        throw new Error('Expected single pet type but found multiple entries');
      }

      return petTypes[0];
    },
  };

  return Object.freeze(repository);
};

export type PetTypesRepository = ReturnType<typeof makePetTypesRepository>;
