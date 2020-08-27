import request from 'supertest';
import makeServer from '../../../app';
import makeDBClient from '../../factory/db-client';
import { Server } from 'http';
import { expect } from 'chai';
import { stub, SinonStub } from 'sinon';
import { makeFakePetTypesRepositoryFactory } from '../../factory/petTypes';
import {
  makeFakePetModifiersRepositoryFactory,
  createPetModifier,
} from '../../factory/petModifier';
import { NewPetModifier } from '../../../features/pet/models/petModifier';

describe('pet routes', () => {
  let server: Server;
  let requireAuthenticationStub: SinonStub;

  before(() => {
    const requireAuthenticationModule = require('../../../middlewares/require-authentication');
    requireAuthenticationStub = stub(
      requireAuthenticationModule,
      'requireAuthentication'
    ).callsFake((req, res, next) => next());
  });

  afterEach((done) => {
    server.close(done);
  });

  after(() => {
    requireAuthenticationStub.restore();
  });

  const petTypesRepositoryModule = require('../../../features/pet/repositories/petTypes');
  let petTypesRepositoryStub: SinonStub;
  const petModifiersRepositoryModule = require('../../../features/pet/repositories/petModifier');
  let petModifiersRepositoryStub: SinonStub;

  afterEach(() => {
    petTypesRepositoryStub?.restore();
    petModifiersRepositoryStub?.restore();
  });

  describe('POST /petModifiers', () => {
    it('should return 201 if there is a pet property in the app and new set of values is unique.', async () => {
      const dbClient = makeDBClient();
      const savePetModifierStub = stub().returns(Promise.resolve());
      petModifiersRepositoryStub = stub(
        petModifiersRepositoryModule,
        'makePetModifiersRepository'
      ).callsFake(
        makeFakePetModifiersRepositoryFactory({
          saveNewPetModifier: savePetModifierStub,
        })
      );
      petTypesRepositoryStub = stub(
        petTypesRepositoryModule,
        'makePetTypesRepository'
      ).callsFake(
        makeFakePetTypesRepositoryFactory({
          checkIfPropertyExists: () => Promise.resolve(true),
        })
      );
      const newPetModifier: NewPetModifier = createPetModifier();

      server = await makeServer(dbClient);

      return request(server)
        .post('/petModifiers')
        .send(newPetModifier)
        .expect(201)
        .expect(() => {
          expect(savePetModifierStub).to.have.been.calledWith(newPetModifier);
        });
    });

    it('should return 400 if there is no pet property in the app.', async () => {
      const dbClient = makeDBClient();
      petTypesRepositoryStub = stub(
        petTypesRepositoryModule,
        'makePetTypesRepository'
      ).callsFake(
        makeFakePetTypesRepositoryFactory({
          checkIfPropertyExists: () => Promise.resolve(false),
        })
      );
      const property = 'hunger';
      const newPetModifier: NewPetModifier = createPetModifier({ property });

      server = await makeServer(dbClient);

      return request(server)
        .post('/petModifiers')
        .send(newPetModifier)
        .expect(404)
        .expect((res) => {
          expect(res.body.message).to.equal(
            `Pet property ${property} doesn't exist`
          );
        });
    });

    it('should return 400 if set of pet modifier values already exists in the app.', async () => {
      const dbClient = makeDBClient();
      const savePetModifierStub = stub().returns(
        Promise.reject(
          new Error(
            'duplicate key value violates unique constraint "pet_modifier_index"'
          )
        )
      );
      petModifiersRepositoryStub = stub(
        petModifiersRepositoryModule,
        'makePetModifiersRepository'
      ).callsFake(
        makeFakePetModifiersRepositoryFactory({
          saveNewPetModifier: savePetModifierStub,
        })
      );
      petTypesRepositoryStub = stub(
        petTypesRepositoryModule,
        'makePetTypesRepository'
      ).callsFake(
        makeFakePetTypesRepositoryFactory({
          checkIfPropertyExists: () => Promise.resolve(true),
        })
      );
      const newPetModifier: NewPetModifier = createPetModifier();

      server = await makeServer(dbClient);

      return request(server)
        .post('/petModifiers')
        .send(newPetModifier)
        .expect(400)
        .expect((res) => {
          expect(res.body.message).to.equal('Pet modifier already exist');
        });
    });
  });
});
