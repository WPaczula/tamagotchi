export type PetPropertyName = string;

interface PetPropertyBase {
  readonly name: PetPropertyName;
  readonly value: number;
  readonly weight: number;
  readonly valuePerTime: number;
}

export interface NewPetProperty extends PetPropertyBase {}

export interface PetProperty extends PetPropertyBase {
  readonly id: number;
}
