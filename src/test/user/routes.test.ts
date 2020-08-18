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
        .query({ page: 0, pageSize: 50 })
        .expect(200)
        .expect((res) => {
          const { totalCount, members, prevPage, nextPage } = res.body;
          expect(members).to.be.deep.equal(usersDto);
          expect(totalCount).to.equal(users.length);
          expect(prevPage).to.be.undefined;
          expect(nextPage).to.be.undefined;
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
        .query({ email, firstName, lastName, page: 0, pageSize: 50 })
        .expect(200)
        .expect((res) => {
          const { totalCount, members } = res.body;
          expect(members).to.be.deep.equal(usersDto);
          expect(totalCount).to.equal(usersDto.length);
          expect(findUsersStub).to.have.been.calledWith({
            email,
            firstName,
            lastName,
          });
        });
    });

    it('should add urls to prev and next pages when there are records for those pages.', async () => {
      const urlModule = require('../../utils/url');
      const url = 'http://server.com/users?pageSize=2&page=1';
      const getCurrentUrlStub = stub(urlModule, 'getCurrentUrl').returns(url);
      const users = Array.from({ length: 6 }).map((_, i) =>
        makeUser({ id: i })
      );
      const usersDto = [makeUserDto({ id: 2 }), makeUserDto({ id: 3 })];
      const dbClient = makeDBClient({ queryRows: users });

      server = await makeServer(dbClient);

      return request(server)
        .get('/users')
        .query({ page: 1, pageSize: 2 })
        .expect(200)
        .expect((res) => {
          const { totalCount, members, prevPage, nextPage } = res.body;
          expect(members).to.be.deep.equal(usersDto);
          expect(totalCount).to.equal(users.length);
          expect(prevPage).to.equal(
            'http://server.com/users?pageSize=2&page=0'
          );
          expect(nextPage).to.equal(
            'http://server.com/users?pageSize=2&page=2'
          );
        })
        .then(() => getCurrentUrlStub.restore());
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

  describe('PATCH users/id', () => {
    const repositoryModule = require('../../features/user/repositories');
    const hashModule = require('../../features/user/utils/hash');
    let repositoryStub: SinonStub;
    let hashStub: SinonStub;

    afterEach(() => {
      repositoryStub?.restore();
      hashStub?.restore();
    });

    it('should update the user if patch is correct and the user exists.', async () => {
      const id = 0;
      const editedUser = makeUser({ id, lastName: null, firstName: 'John' });
      const updateUserStub = stub();
      repositoryStub = stub(repositoryModule, 'makeUsersRepository').callsFake(
        makeFakeUsersRepositoryFactory({
          findOne: () => Promise.resolve(editedUser),
          updateUser: updateUserStub,
        })
      );
      const patch = [
        {
          op: 'remove',
          path: '/firstName',
        },
        {
          op: 'add',
          path: '/lastName',
          value: 'New Last Name',
        },
        {
          op: 'replace',
          path: '/email',
          value: 'new@email.com',
        },
      ];

      server = await makeServer(makeDBClient());

      return request(server)
        .patch(`/users/${id}`)
        .send(patch)
        .expect(204)
        .expect(() => {
          expect(updateUserStub).to.have.been.calledWith({
            id: editedUser.id,
            email: 'new@email.com',
            password: editedUser.password,
            lastName: 'New Last Name',
          });
        });
    });

    it('should be able to update the password hash.', async () => {
      const id = 0;
      const editedUser = makeUser({ id, password: 'hash123123123123' });
      const updateUserStub = stub();
      repositoryStub = stub(repositoryModule, 'makeUsersRepository').callsFake(
        makeFakeUsersRepositoryFactory({
          findOne: () => Promise.resolve(editedUser),
          updateUser: updateUserStub,
        })
      );
      hashStub = stub(hashModule, 'hash').returns('new-hashed-password');
      const patch = [
        {
          op: 'replace',
          path: '/password',
          value: 'new-password',
        },
      ];

      server = await makeServer(makeDBClient());

      return request(server)
        .patch(`/users/${id}`)
        .send(patch)
        .expect(204)
        .expect(() => {
          expect(updateUserStub).to.have.been.calledWith({
            ...editedUser,
            password: 'new-hashed-password',
          });
        });
    });

    it('should be return 404 if the user is not found.', async () => {
      repositoryStub = stub(repositoryModule, 'makeUsersRepository').callsFake(
        makeFakeUsersRepositoryFactory({
          findOne: () => Promise.resolve(undefined),
        })
      );
      const patch = [
        {
          op: 'replace',
          path: '/email',
          value: 'new-email@mail.com',
        },
      ];

      server = await makeServer(makeDBClient());

      return request(server).patch('/users/404').send(patch).expect(404);
    });

    it('should be return 400 if id was updated.', async () => {
      const id = 0;
      const editedUser = makeUser({ id });
      repositoryStub = stub(repositoryModule, 'makeUsersRepository').callsFake(
        makeFakeUsersRepositoryFactory({
          findOne: () => Promise.resolve(editedUser),
        })
      );
      const patch = [
        {
          op: 'replace',
          path: '/id',
          value: 1000,
        },
      ];

      server = await makeServer(makeDBClient());

      return request(server).patch(`/users/${id}`).send(patch).expect(400);
    });

    it('should be return 400 if id was updated.', async () => {
      const id = 0;
      const editedUser = makeUser({ id });
      repositoryStub = stub(repositoryModule, 'makeUsersRepository').callsFake(
        makeFakeUsersRepositoryFactory({
          findOne: () => Promise.resolve(editedUser),
          checkIfEmailIsInUse: () => Promise.resolve(true),
        })
      );
      const patch = [
        {
          op: 'replace',
          path: '/email',
          value: 'existing@email.com',
        },
      ];

      server = await makeServer(makeDBClient());

      return request(server).patch(`/users/${id}`).send(patch).expect(409);
    });
  });

  describe('DELETE users/:id', () => {
    const repositoryModule = require('../../features/user/repositories');
    let repositoryStub: SinonStub;

    afterEach(() => {
      repositoryStub?.restore();
    });

    it('should delete the user and return 204 if user exists.', async () => {
      const id = 0;
      const deletedUser = makeUser({ id });
      const deleteUserStub = stub();
      repositoryStub = stub(repositoryModule, 'makeUsersRepository').callsFake(
        makeFakeUsersRepositoryFactory({
          findOne: () => Promise.resolve(deletedUser),
          deleteUser: deleteUserStub,
        })
      );

      server = await makeServer(makeDBClient());

      return request(server)
        .delete(`/users/${id}`)
        .expect(204)
        .expect(() => {
          expect(deleteUserStub).to.have.been.calledWith(id);
        });
    });

    it('should delete the user and return 404 if user does not exist.', async () => {
      const id = 0;
      const deleteUserStub = stub();
      repositoryStub = stub(repositoryModule, 'makeUsersRepository').callsFake(
        makeFakeUsersRepositoryFactory({
          findOne: () => Promise.resolve(undefined),
          deleteUser: deleteUserStub,
        })
      );

      server = await makeServer(makeDBClient());

      return request(server).delete(`/users/${id}`).expect(404);
    });
  });
});
