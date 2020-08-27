import { validateNewPet } from '../validators/pet';

export interface NewPet {
  readonly name: string;
  readonly petTypeId: number;
  readonly userId: number;
}

export const makeNewPet = async (
  name: string,
  petTypeId: number,
  userId: number
) => {
  const newPet = await validateNewPet({ name, petTypeId, userId });

  return Object.freeze(newPet);
};
