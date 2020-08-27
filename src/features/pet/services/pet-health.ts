import { PetPropertiesRepository } from '../repositories/petProperty';
import { PetPropertyValue } from '../models/petProperty';
import { Pet } from '../models/pet';
import { PassedTimeCalculationFunction } from '../utils/date';

export const makePetHealthService = (
  petPropertiesRepository: PetPropertiesRepository,
  calculatePassedTime: PassedTimeCalculationFunction
) => {
  const service = {
    getPetsHealth: async (pet: Pet) => {
      const propertyValues = await petPropertiesRepository.getPropertyValues(
        pet.id
      );
      const petProperties = await petPropertiesRepository.getProperties(
        pet.petTypeId
      );

      const updatedPropertyValues: PetPropertyValue[] = [];
      let healthAggregate = 0;
      let healthWeightDivider = 0;

      propertyValues.forEach((cp) => {
        const property = petProperties.find((pp) => pp.id === cp.petPropertyId);

        if (property === undefined) {
          throw new Error(
            'Could not find property with id: ' + cp.petPropertyId
          );
        }

        const { valuePerTime, weight } = property;
        const { value, updatedAt } = cp;

        const newValue = Math.max(
          value - calculatePassedTime(updatedAt) * valuePerTime,
          0
        );

        healthAggregate += newValue * weight;
        healthWeightDivider += weight;

        updatedPropertyValues.push({
          ...cp,
          value: newValue,
          updatedAt: new Date(),
        });
      });

      await petPropertiesRepository.savePropertyValues(updatedPropertyValues);

      const health = healthAggregate / healthWeightDivider;
      return health;
    },
  };

  return Object.freeze(service);
};

export type PetHealthService = ReturnType<typeof makePetHealthService>;
