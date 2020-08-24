import { PetPropertyName } from './petProperty';
import { validateNewPetModifier } from '../validators/petModifier';

interface PetModifierBase {
  readonly name: string;
  readonly property: PetPropertyName;
  readonly modifier: number;
}

export interface NewPetModifier extends PetModifierBase {}

export interface PetModifier extends PetModifierBase {
  readonly id: number;
}

export const makeNewPetModifier = async (
  name: string,
  property: PetPropertyName,
  modifier: number
): Promise<NewPetModifier> => {
  const petModifier = await validateNewPetModifier({
    name,
    property,
    modifier,
  });

  return Object.freeze(petModifier);
};
