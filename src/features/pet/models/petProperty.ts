export interface NewPetProperty {
  readonly name: string;
  readonly value: number;
  readonly weight: number;
  readonly valuePerTime: number;
}

export interface PetProperty extends NewPetProperty {
  readonly id: number;
}
