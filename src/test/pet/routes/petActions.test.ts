import request from 'supertest';
import makeServer from '../../../app';
import makeDBClient from '../../factory/db-client';
import { Server } from 'http';
import { expect } from 'chai';
import { stub, SinonStub } from 'sinon';
import {
  makeFakePetTypesRepositoryFactory,
  createPetType,
} from '../../factory/petTypes';
import { makeFakePetModifiersRepositoryFactory } from '../../factory/petModifier';
import {
  createNewPetAction,
  makeFakePetActionsRepositoryFactory,
  createPetAction,
} from '../../factory/petAction';

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
  const petActionsRepositoryModule = require('../../../features/pet/repositories/petAction');
  let petActionRepositoryStub: SinonStub;

  afterEach(() => {
    petTypesRepositoryStub?.restore();
    petModifiersRepositoryStub?.restore();
    petActionRepositoryStub?.restore();
  });

  describe('POST /petActions', () => {
    it('should return 404 if pet type does not exist', async () => {
      petTypesRepositoryStub = stub(
        petTypesRepositoryModule,
        'makePetTypesRepository'
      ).callsFake(
        makeFakePetTypesRepositoryFactory({
          findOne: () => Promise.resolve(undefined),
        })
      );
      const petTypeId = 1;
      const petAction = createNewPetAction({ petTypeId });
      const dbClient = makeDBClient();

      server = await makeServer(dbClient);

      return request(server)
        .post('/petActions')
        .send(petAction)
        .expect(404)
        .expect((res) => {
          expect(res.body.message).to.equal(
            `Pet type with id ${petTypeId} could not be found`
          );
        });
    });

    it('should return 404 if pet type does not exist', async () => {
      petTypesRepositoryStub = stub(
        petTypesRepositoryModule,
        'makePetTypesRepository'
      ).callsFake(
        makeFakePetTypesRepositoryFactory({
          findOne: () => Promise.resolve(createPetType()),
        })
      );
      const petModifierIds = [1, 2, 3];
      petModifiersRepositoryStub = stub(
        petModifiersRepositoryModule,
        'makePetModifiersRepository'
      ).callsFake(
        makeFakePetModifiersRepositoryFactory({
          checkExistingIds: () => Promise.resolve([1]),
        })
      );
      const petAction = createNewPetAction({ petModifierIds });
      const dbClient = makeDBClient();

      server = await makeServer(dbClient);

      return request(server)
        .post('/petActions')
        .send(petAction)
        .expect(404)
        .expect((res) => {
          expect(res.body.message).to.equal(
            'Could not find pet modifier with id(s) 2,3'
          );
        });
    });

    it('should return 201 if pet action is created.', async () => {
      petTypesRepositoryStub = stub(
        petTypesRepositoryModule,
        'makePetTypesRepository'
      ).callsFake(
        makeFakePetTypesRepositoryFactory({
          findOne: () => Promise.resolve(createPetType()),
        })
      );
      const petModifierIds = [1];
      petModifiersRepositoryStub = stub(
        petModifiersRepositoryModule,
        'makePetModifiersRepository'
      ).callsFake(
        makeFakePetModifiersRepositoryFactory({
          checkExistingIds: () => Promise.resolve(petModifierIds),
        })
      );
      const saveNewPetActioNStub = stub().returns(Promise.resolve());
      petActionRepositoryStub = stub(
        petActionsRepositoryModule,
        'makePetActionsRepository'
      ).callsFake(
        makeFakePetActionsRepositoryFactory({
          saveNewPetAction: saveNewPetActioNStub,
        })
      );
      const petAction = createNewPetAction({ petModifierIds });
      const dbClient = makeDBClient();

      server = await makeServer(dbClient);

      return request(server)
        .post('/petActions')
        .send(petAction)
        .expect(201)
        .expect(() => {
          expect(saveNewPetActioNStub).to.have.been.called;
        });
    });
  });

  describe('GET /petActions', () => {
    it('should return paged pet actions.', async () => {
      const petActions = [
        createPetAction({ id: 0 }),
        createPetAction({ id: 1 }),
      ];
      const getAllPetActionsStub = stub().returns(petActions);
      petActionRepositoryStub = stub(
        petActionsRepositoryModule,
        'makePetActionsRepository'
      ).callsFake(
        makeFakePetActionsRepositoryFactory({
          getAllPetActions: getAllPetActionsStub,
        })
      );
      const dbClient = makeDBClient();

      server = await makeServer(dbClient);

      return request(server)
        .get('/petActions?page=0&pageSize=50')
        .expect(200)
        .expect((res) => {
          expect(res.body.members).to.deep.equal(petActions);
        });
    });
  });
});
