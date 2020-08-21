import { stub, SinonStub } from 'sinon';
import { makePetTypesRepository } from '../../features/pet/repositories';
import makeDBClient from '../factory/db-client';
import { expect } from 'chai';
import { createPetType, createPetProperty } from '../factory/petTypes';
import { PetTypeWithPropertyArray } from '../../features/pet/models/petTypes';

describe('petTypesRepository', () => {
  let findByStub: SinonStub;

  before(() => {
    const findByModule = require('../../utils/find-by');
    findByStub = stub(findByModule, 'findBy');
  });

  after(() => {
    findByStub.restore();
  });

  it('should load pet properties and map them to PetType properly', async () => {
    const petTypesWithPropertyArrays: PetTypeWithPropertyArray[] = [
      {
        id: 0,
        name: 'Cat',
        ids: [0, 1],
        names: ['hunger', 'cuvette'],
        values: [10, 20],
        weights: [1, 2],
        valuesPerTime: [0.1, 0.2],
      },
      {
        id: 1,
        name: 'Dog',
        ids: [3],
        names: ['hunger'],
        values: [15],
        weights: [15],
        valuesPerTime: [0.15],
      },
    ];
    findByStub.returns(Promise.resolve(petTypesWithPropertyArrays));
    const repository = makePetTypesRepository(makeDBClient());

    const petTypes = await repository.find();

    expect(petTypes).to.deep.equal([
      createPetType({
        id: 0,
        name: 'Cat',
        properties: [
          createPetProperty({
            id: 0,
            value: 10,
            name: 'hunger',
            weight: 1,
            valuePerTime: 0.1,
          }),
          createPetProperty({
            id: 1,
            value: 20,
            name: 'cuvette',
            weight: 2,
            valuePerTime: 0.2,
          }),
        ],
      }),
      createPetType({
        id: 1,
        name: 'Dog',
        properties: [
          createPetProperty({
            id: 3,
            name: 'hunger',
            value: 15,
            weight: 15,
            valuePerTime: 0.15,
          }),
        ],
      }),
    ]);
  });
});
