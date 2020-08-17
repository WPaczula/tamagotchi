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

const authModule = require('../../features/user/middlewares/auth');
stub(authModule, 'authenticated').callsFake((req, res, next) => next());

describe('user routes', () => {
  let server: Server;

  afterEach((done) => {
    server.close(done);
  });
  describe('GET users', () => {
    const repositoryModule = require('../../features/user/repositories');
    let repositoryStub: SinonStub;

    afterEach(() => {
      repositoryStub?.restore();
    });

    it('should return users from db.', async () => {
      const users = [makeUser({ id: 0 }), makeUser({ id: 1 })];
      const usersDto = [makeUserDto({ id: 0 }), makeUserDto({ id: 1 })];
      const dbClient = makeDBClient({ queryRows: users });

      server = await makeServer(dbClient);

      return request(server)
        .get('/users')
        .expect(200)
        .expect((res) => {
          expect(res.body).to.be.deep.equal(usersDto);
        });
    });

    it('should return users having given email, first and last name if query params are specified.', async () => {
      const email = 'email@email.com';
      const firstName = 'Bob';
      const lastName = 'Smith';
      const usersDto = [makeUserDto({ id: 0, email, firstName, lastName })];
      const dbClient = makeDBClient();
      const findUsersStub = stub().returns([
        makeUser({ id: 0, email, firstName, lastName }),
      ]);
      repositoryStub = stub(repositoryModule, 'makeUsersRepository').callsFake(
        makeFakeUsersRepositoryFactory({
          find: findUsersStub,
        })
      );

      server = await makeServer(dbClient);

      return request(server)
        .get('/users')
        .query({ email, firstName, lastName })
        .expect(200)
        .expect((res) => {
          expect(res.body).to.be.deep.equal(usersDto);
          expect(findUsersStub).to.have.been.calledWith({
            email,
            firstName,
            lastName,
          });
        });
    });
  });

  describe('POST register', () => {
    it('should return 400 invalid error if user with a given email already exists.', async () => {
      const email = 'email@email.com';
      const users = [makeUser({ email })];
      const dbClient = makeDBClient({ queryRows: users });
      const newUser: NewUser = { email, password: 'password' };

      server = await makeServer(dbClient);

      return request(server)
        .post('/register')
        .send(newUser)
        .expect(400)
        .expect((res) => {
          expect(res.body.message).to.be.equal('email is already used.');
        });
    });

    it('should return 201 - created if user was successfuly created.', async () => {
      const dbClient = makeDBClient({ queryRows: [] });
      const newUser: NewUser = {
        email: 'other-email@email.com',
        password: 'password',
      };

      server = await makeServer(dbClient);

      return request(server).post('/register').send(newUser).expect(201);
    });
  });

  describe('POST login', () => {
    const hashModule = require('../../features/user/utils/hash');
    let hashStub: SinonStub;

    afterEach(() => {
      hashStub.restore();
    });

    it('should return 204 and set session cookie if the user is successfully authenticated.', async () => {
      hashStub = stub(hashModule, 'compareHash').returns(true);
      const email = 'email@email.com';
      const password = 'password';
      const credentials = { email, password };
      const users = [makeUser({ email, password })];
      const dbClient = makeDBClient({ queryRows: users });

      server = await makeServer(dbClient);

      return request(server)
        .post('/login')
        .send(credentials)
        .expect(204)
        .expect((res) => {
          expect(res.header['set-cookie']).not.to.be.empty;
        });
    });

    it('should return 401 if the user provided wrong password.', async () => {
      hashStub = stub(hashModule, 'compareHash').returns(false);
      const email = 'email@email.com';
      const credentials = { email, password: 'wrong-password' };
      const users = [makeUser({ email })];
      const dbClient = makeDBClient({ queryRows: users });

      server = await makeServer(dbClient);

      return request(server).post('/login').send(credentials).expect(401);
    });

    it('should return 401 if the user does not exist.', async () => {
      const credentials = {
        email: 'not-existing@email.com',
        password: 'password',
      };
      const users: User[] = [];
      const dbClient = makeDBClient({ queryRows: users });

      server = await makeServer(dbClient);

      return request(server).post('/login').send(credentials).expect(401);
    });
  });
});
