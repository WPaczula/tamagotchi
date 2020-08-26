import request from 'supertest';
import makeServer from '../../app';
import makeDBClient from '../factory/db-client';
import { Server } from 'http';
import { expect } from 'chai';
import { stub, SinonStub } from 'sinon';
import {
  makeFakePetTypesRepositoryFactory,
  createNewPetType,
  createPetType,
} from '../factory/petTypes';
import { NewPetType } from '../../features/pet/models/petTypes';
import {
  makeFakePetModifiersRepositoryFactory,
  createPetModifier,
} from '../factory/petModifier';
import { NewPetModifier } from '../../features/pet/models/petModifier';
import {
  createNewPetAction,
  makeFakePetActionsRepositoryFactory,
  createPetAction,
} from '../factory/petAction';

describe('user routes', () => {
  let server: Server;
  let requireAuthenticationStub: SinonStub;

  before(() => {
    const requireAuthenticationModule = require('../../middlewares/require-authentication');
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

  const petTypesRepositoryModule = require('../../features/pet/repositories/petTypes');
  let petTypesRepositoryStub: SinonStub;
  const petModifiersRepositoryModule = require('../../features/pet/repositories/petModifier');
  let petModifiersRepositoryStub: SinonStub;
  const petActionsRepositoryModule = require('../../features/pet/repositories/petAction');
  let petActionRepositoryStub: SinonStub;

  afterEach(() => {
    petTypesRepositoryStub?.restore();
    petModifiersRepositoryStub?.restore();
    petActionRepositoryStub?.restore();
  });

  describe('POST petTypes', () => {
    it('should return 400 invalid name is provided.', async () => {
      const name = 'X';
      const dbClient = makeDBClient();

      server = await makeServer(dbClient);

      return request(server).post('/petTypes').send({ name }).expect(400);
    });

    it('should return 201 - created if pet type was successfuly created.', async () => {
      const name = 'Capybara';
      const dbClient = makeDBClient();
      const createPetTypeStub = stub().returns(Promise.resolve());
      petTypesRepositoryStub = stub(
        petTypesRepositoryModule,
        'makePetTypesRepository'
      ).callsFake(
        makeFakePetTypesRepositoryFactory({
          createPetType: createPetTypeStub,
        })
      );
      const newPetType: NewPetType = createNewPetType({ name });

      server = await makeServer(dbClient);

      return request(server)
        .post('/petTypes')
        .send(newPetType)
        .expect(201)
        .expect(() => {
          expect(createPetTypeStub).to.have.been.calledWith(newPetType);
        });
    });

    it('should return 409 if pet type already exists.', async () => {
      const dbClient = makeDBClient();
      const name = 'Capybara';
      const petType = createPetType({ name });
      const newPetType = createNewPetType({ name });
      const findPetTypeStub = stub().returns(Promise.resolve(petType));
      petTypesRepositoryStub = stub(
        petTypesRepositoryModule,
        'makePetTypesRepository'
      ).callsFake(
        makeFakePetTypesRepositoryFactory({
          findOne: findPetTypeStub,
        })
      );

      server = await makeServer(dbClient);

      return request(server).post('/petTypes').send(newPetType).expect(409);
    });
  });

  describe('GET petTypes', () => {
    it('should return 400 if no paging parameters are provided.', async () => {
      const dbClient = makeDBClient();

      server = await makeServer(dbClient);

      return request(server).get('/petTypes').expect(400);
    });

    it('should return paged list of pet types if paging query is valid.', async () => {
      const dbClient = makeDBClient();
      const petTypes = Array.from({ length: 10 }).map((_, i) =>
        createPetType({ id: i, name: `Pet-${i}` })
      );
      const findStub = stub().returns(Promise.resolve(petTypes));
      petTypesRepositoryStub = stub(
        petTypesRepositoryModule,
        'makePetTypesRepository'
      ).callsFake(
        makeFakePetTypesRepositoryFactory({
          find: findStub,
        })
      );

      server = await makeServer(dbClient);

      return request(server)
        .get('/petTypes')
        .query({ page: 0, pageSize: 50 })
        .expect(200)
        .expect((res) => {
          expect(res.body).to.be.deep.equal({
            members: petTypes,
            totalCount: petTypes.length,
          });
        });
    });

    describe('POST petModifiers', () => {
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

    describe('POST petActions', () => {
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

      it('should return 404 if pet type does not exist', async () => {
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
          .expect(204)
          .expect(() => {
            expect(saveNewPetActioNStub).to.have.been.called;
          });
      });
    });

    describe('GET petActions', () => {
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
});
