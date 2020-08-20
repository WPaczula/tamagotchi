import { validateNewPetType } from '../validators/petTypes';
import { NewPetProperty, PetProperty } from './petProperty';

interface PetTypeBase {
  readonly name: string;
}

export interface NewPetType extends PetTypeBase {
  readonly properties: NewPetProperty[];
}

export interface PetType extends PetTypeBase {
  readonly id: number;
  readonly properties: PetProperty[];
}

export interface PetTypeWithPropertyArray extends PetTypeBase {
  readonly id: number;
  readonly ids: number[];
  readonly names: string[];
  readonly values: number[];
  readonly weights: number[];
  readonly valuesPerTime: number[];
}

export const makePetType = async (
  name: string,
  properties: NewPetProperty[]
): Promise<NewPetType> => {
  const petType = await validateNewPetType({
    name,
    properties,
  });

  return Object.freeze(petType);
};
