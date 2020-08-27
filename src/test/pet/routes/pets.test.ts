import request from 'supertest';
import makeServer from '../../../app';
import makeDBClient from '../../factory/db-client';
import { Server } from 'http';
import { stub, SinonStub } from 'sinon';
import {
  makeFakePetTypesRepositoryFactory,
  createPetType,
} from '../../factory/petTypes';
import {
  createNewPetDto,
  makeFakePetRepositoryFactory,
  createNewPet,
} from '../../factory/pet';
import { makeUser } from '../../factory/user';
import { expect } from 'chai';

describe('pet routes', () => {
  let server: Server;
  let requireAuthenticationStub: SinonStub;
  const user = makeUser();
  before(() => {
    const requireAuthenticationModule = require('../../../middlewares/require-authentication');
    requireAuthenticationStub = stub(
      requireAuthenticationModule,
      'requireAuthentication'
    ).callsFake((req, res, next) => {
      req.user = user;
      next();
    });
  });

  afterEach((done) => {
    server.close(done);
  });

  after(() => {
    requireAuthenticationStub.restore();
  });

  const petTypesRepositoryModule = require('../../../features/pet/repositories/petTypes');
  let petTypesRepositoryStub: SinonStub;
  const petsRepositoryModule = require('../../../features/pet/repositories/pet');
  let petsRepositoryStub: SinonStub;

  afterEach(() => {
    petTypesRepositoryStub?.restore();
    petsRepositoryStub?.restore();
  });

  describe('POST pets', () => {
    it('should return 404 if pet type is not found.', async () => {
      petTypesRepositoryStub = stub(
        petTypesRepositoryModule,
        'makePetTypesRepository'
      ).callsFake(
        makeFakePetTypesRepositoryFactory({
          findOne: () => Promise.resolve(undefined),
        })
      );
      const pet = createNewPetDto();

      server = await makeServer(makeDBClient());

      return request(server).post('/pets').send(pet).expect(404);
    });

    it('should return 201 if pet is created properly.', async () => {
      petTypesRepositoryStub = stub(
        petTypesRepositoryModule,
        'makePetTypesRepository'
      ).callsFake(
        makeFakePetTypesRepositoryFactory({
          findOne: () => Promise.resolve(createPetType()),
        })
      );
      const saveNewPetStub = stub().returns(Promise.resolve());
      petsRepositoryStub = stub(
        petsRepositoryModule,
        'makePetsRepository'
      ).callsFake(
        makeFakePetRepositoryFactory({
          saveNewPet: saveNewPetStub,
        })
      );
      const pet = createNewPetDto();

      server = await makeServer(makeDBClient());

      return request(server)
        .post('/pets')
        .send(pet)
        .expect(201)
        .expect(() => {
          expect(saveNewPetStub).to.have.been.calledWith(
            createNewPet({ ...pet, userId: user.id })
          );
        });
    });
  });
});
