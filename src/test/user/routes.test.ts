import request from 'supertest';
import makeServer from '../../app';
import makeDBClient from '../factory/db-client';
import { makeUser } from '../factory/user';
import { Server } from 'http';
import { expect } from 'chai';

describe('user routes', () => {
  describe('GET users', () => {
    let server: Server;

    afterEach((done) => {
      server.close(done);
    });

    it('should return users from db.', async () => {
      const users = [makeUser({ id: 0 }), makeUser({ id: 1 })];
      const dbClient = makeDBClient({ queryRows: users });

      server = await makeServer(dbClient);

      return request(server)
        .get('/users')
        .expect(200)
        .expect((res) => {
          expect(res.body).to.be.deep.equal(users);
        });
    });
  });
});
