import { validateNewPetType } from '../validators/petTypes';

export interface NewPetType {
  readonly name: string;
}

export interface PetType extends NewPetType {
  readonly id: number;
}

export const makePetType = async (name: string): Promise<NewPetType> => {
  const petType = await validateNewPetType({
    name,
  });

  return Object.freeze(petType);
};
