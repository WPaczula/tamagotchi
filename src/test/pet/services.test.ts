import { makeFakeDateService } from '../factory/date';
import { makeFakePropertyRepository } from '../factory/petProperty';
import { makePetsHealthService } from '../../features/pet/services/pet-health';
import { createPetProperty, createPetPropertyValue } from '../factory/petTypes';
import { stub } from 'sinon';
import { createPet } from '../factory/pet';
import { expect } from 'chai';

describe('pets health service', () => {
  it('should save new updated at date', async () => {
    const date = new Date();
    const dateService = makeFakeDateService({
      getCurrentDate: () => date,
    });
    const properties = [createPetProperty({ id: 1 })];
    const propertyValues = [createPetPropertyValue({ petPropertyId: 1 })];
    const savePropertyValuesStub = stub().returns(Promise.resolve());
    const petPropertiesRepository = makeFakePropertyRepository({
      getProperties: () => Promise.resolve(properties),
      getPropertyValues: () => Promise.resolve(propertyValues),
      savePropertyValues: savePropertyValuesStub,
    });
    const petHealthService = makePetsHealthService(
      petPropertiesRepository,
      dateService
    );
    const pet = createPet();

    await petHealthService.getPetsHealth(pet);

    expect(savePropertyValuesStub).to.have.been.calledWith([
      { ...propertyValues[0], updatedAt: date },
    ]);
  });

  it('should calculate weighted average of new values as health', async () => {
    const dateService = makeFakeDateService({
      calculatePassedTime: () => 0,
    });
    const values = [100, 200];
    const weights = [10, 20];
    const properties = Array.from({ length: 2 }).map((_, i) =>
      createPetProperty({ id: i, weight: weights[i] })
    );
    const propertyValues = Array.from({ length: 2 }).map((_, i) =>
      createPetPropertyValue({ id: i, petPropertyId: i, value: values[i] })
    );
    const petPropertiesRepository = makeFakePropertyRepository({
      getProperties: () => Promise.resolve(properties),
      getPropertyValues: () => Promise.resolve(propertyValues),
    });
    const petHealthService = makePetsHealthService(
      petPropertiesRepository,
      dateService
    );
    const pet = createPet();

    const health = await petHealthService.getPetsHealth(pet);

    expect(health).to.equal(
      (values[0] * weights[0] + values[1] * weights[1]) /
        (weights[0] + weights[1])
    );
  });

  it('should calculate new property value based on passed time.', async () => {
    const decay = 1 / 1000;
    const currentPropertyValue = 100;
    const passedTime = 1000;
    const dateService = makeFakeDateService({
      calculatePassedTime: () => passedTime,
    });
    const properties = [createPetProperty({ id: 1, valuePerTime: decay })];
    const propertyValues = [
      createPetPropertyValue({
        id: 1,
        petPropertyId: 1,
        value: currentPropertyValue,
      }),
    ];
    const savePropertyValuesStub = stub().returns(Promise.resolve());
    const petPropertiesRepository = makeFakePropertyRepository({
      getProperties: () => Promise.resolve(properties),
      getPropertyValues: () => Promise.resolve(propertyValues),
      savePropertyValues: savePropertyValuesStub,
    });
    const petHealthService = makePetsHealthService(
      petPropertiesRepository,
      dateService
    );
    const pet = createPet();

    await petHealthService.getPetsHealth(pet);

    const updatedProperties = savePropertyValuesStub.firstCall.args[0];
    expect(updatedProperties[0].value).to.equal(
      currentPropertyValue - decay * passedTime
    );
  });
});
