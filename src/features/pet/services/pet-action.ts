import { PetPropertiesRepository } from '../repositories/petProperty';
import { Pet } from '../models/pet';
import { PetAction } from '../models/petAction';
import { PetModifiersRepository } from '../repositories';

export const makePetActionsService = (
  petPropertiesRepository: PetPropertiesRepository,
  petModifiersRepository: PetModifiersRepository
) => {
  const service = {
    applyAction: async (pet: Pet, action: PetAction) => {
      const properties = await petPropertiesRepository.getProperties(
        pet.petTypeId
      );
      const propertyValues = await petPropertiesRepository.getPropertyValues(
        pet.id
      );
      const modifiers = await petModifiersRepository.findByIds(
        action.petModifierIds
      );

      const newPropertyValues = propertyValues
        .map((pv) => {
          const property = properties.find((p) => p.id === pv.petPropertyId);

          if (property === undefined) {
            throw new Error(
              `Property with id: ${pv.petPropertyId} was not found`
            );
          }

          return {
            ...pv,
            name: property.name,
            maxValue: property.value,
          };
        })
        .map(({ name, maxValue, ...pv }) => {
          const modifier = modifiers.find((m) => m.property === name);

          if (modifier) {
            const newValue = Math.min(maxValue, pv.value + modifier.modifier);

            return {
              ...pv,
              value: newValue,
            };
          }

          return pv;
        });

      await petPropertiesRepository.savePropertyValues(newPropertyValues);
    },
  };

  return Object.freeze(service);
};

export type PetActionsService = ReturnType<typeof makePetActionsService>;
