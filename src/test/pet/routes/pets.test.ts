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
  createPet,
  makeFakePetHealthServiceFactory,
} from '../../factory/pet';
import { makeUser } from '../../factory/user';
import { expect } from 'chai';
import { PetDto } from '../../../features/pet/models/pet';

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
  const petHealthServiceModule = require('../../../features/pet/services/pet-health');
  let petsHealthServiceStub: SinonStub;

  afterEach(() => {
    petTypesRepositoryStub?.restore();
    petsRepositoryStub?.restore();
    petsHealthServiceStub?.restore();
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

  describe('GET /pets/:id', () => {
    it('should return 404 if pet was not found.', async () => {
      const id = 1;
      const findOneStub = stub().returns(Promise.resolve(undefined));
      petsRepositoryStub = stub(
        petsRepositoryModule,
        'makePetsRepository'
      ).callsFake(
        makeFakePetRepositoryFactory({
          findOne: findOneStub,
        })
      );

      server = await makeServer(makeDBClient());

      return request(server)
        .get('/pets/1')
        .expect(404)
        .expect(() => {
          expect(findOneStub).to.have.been.calledWith({ id });
        });
    });

    it('should return 200 and pet health if pet was found.', async () => {
      const pet = createPet();
      petsRepositoryStub = stub(
        petsRepositoryModule,
        'makePetsRepository'
      ).callsFake(
        makeFakePetRepositoryFactory({
          findOne: () => Promise.resolve(pet),
        })
      );
      const health = 100;
      petsHealthServiceStub = stub(
        petHealthServiceModule,
        'makePetsHealthService'
      ).callsFake(
        makeFakePetHealthServiceFactory({
          getPetsHealth: () => Promise.resolve(health),
        })
      );
      const petDto: PetDto = { ...pet, health };

      server = await makeServer(makeDBClient());

      return request(server)
        .get('/pets/1')
        .expect(200)
        .expect((res) => {
          expect(res.body).to.be.deep.equal(petDto);
        });
    });
  });
});
