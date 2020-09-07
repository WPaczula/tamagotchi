import { validateNewPetAction } from '../validators/petAction';

interface PetActionBase {
  readonly name: string;
  readonly petTypeId: number;
  readonly petModifierIds: number[];
}

export interface NewPetAction extends PetActionBase {}

export interface PetAction extends PetActionBase {
  readonly id: number;
}

export const makeNewPetAction = async (
  name: string,
  petTypeId: number,
  petModifierIds: number[]
): Promise<NewPetAction> => {
  const newPetAction = await validateNewPetAction({
    name,
    petTypeId,
    petModifierIds,
  });

  return Object.freeze(newPetAction);
};
