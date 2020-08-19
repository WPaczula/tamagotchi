import request from 'supertest';
import makeServer from '../../app';
import makeDBClient from '../factory/db-client';
import {
  makeUser,
  makeUserDto,
  makeFakeUsersRepositoryFactory,
} from '../factory/user';
import { Server } from 'http';
import { expect } from 'chai';
import { NewUser } from '../../features/user/models/auth';
import { stub, SinonStub } from 'sinon';
import { User } from '../../features/user/models/user';
import {
  makeFakePetTypesRepositoryFactory,
  createNewPetType,
  createPetType,
} from '../factory/petTypes';
import { NewPetType, makePetType } from '../../features/pet/models/petTypes';

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

  const repositoryModule = require('../../features/pet/repositories/petTypes');
  let repositoryStub: SinonStub;

  afterEach(() => {
    repositoryStub?.restore();
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
      repositoryStub = stub(
        repositoryModule,
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
        .send({ name })
        .expect(201)
        .expect(() => {
          expect(createPetTypeStub).to.have.been.calledWith(newPetType);
        });
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
      const getPetTypesStub = stub().returns(Promise.resolve(petTypes));
      repositoryStub = stub(
        repositoryModule,
        'makePetTypesRepository'
      ).callsFake(
        makeFakePetTypesRepositoryFactory({
          getPetTypes: getPetTypesStub,
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
  });
});
