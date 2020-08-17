import request from 'supertest';
import makeServer from '../../app';
import makeDBClient from '../factory/db-client';
import { makeUser, makeUserDto } from '../factory/user';
import { Server } from 'http';
import { expect } from 'chai';
import { NewUser } from '../../features/user/models/auth';
import { stub } from 'sinon';

const authModule = require('../../features/user/middlewares/auth');
stub(authModule, 'authenticated').callsFake((req, res, next) => next());

describe('user routes', () => {
  let server: Server;

  afterEach((done) => {
    server.close(done);
  });
  describe('GET users', () => {
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
});
