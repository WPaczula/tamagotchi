import { DBClient } from '../../../database';
import { NewPetType, PetType } from '../models/petTypes';
import { findBy } from '../../../utils/find-by';

export const makePetTypesRepository = (dbClient: DBClient) => {
  const repository = {
    createPetType: async (newPetType: NewPetType): Promise<void> => {
      await dbClient.query(
        `
        INSERT INTO pet_types (name)
        VALUES ($1)
      `,
        [newPetType.name]
      );
    },

    find: async (petType: Partial<PetType> = {}): Promise<PetType[]> => {
      const petTypes = await findBy(
        dbClient,
        petType,
        `
          SELECT p.id, p.name
          FROM pet_types p
        `
      );

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
