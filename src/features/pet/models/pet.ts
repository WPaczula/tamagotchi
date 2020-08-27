import { validateNewPet } from '../validators/pet';

export interface NewPetDto {
  readonly name: string;
  readonly petTypeId: number;
}

interface PetBase {
  readonly name: string;
  readonly petTypeId: number;
  readonly userId: number;
}

export interface NewPet extends PetBase {}

export interface Pet extends PetBase {
  readonly id: number;
}

export interface PetDto extends PetBase {
  readonly id: number;
  readonly health: number;
}

export const makeNewPet = async (
  name: string,
  petTypeId: number,
  userId: number
) => {
  const newPet = await validateNewPet({ name, petTypeId, userId });

  return Object.freeze(newPet);
};
