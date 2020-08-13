import { makeNewUserFactory } from '../../features/user/models/auth';
import { expect } from 'chai';
import ValidationError from '../../errors/validation';
import { HashFunction } from '../../features/user/utils/hash';

describe('user models', () => {
  describe('new user model factory', () => {
    it('should throw when user has no email.', async () => {
      const hash = (t: string) => Promise.resolve(t);
      const newUserFactory = makeNewUserFactory(hash);

      const createUser = async () => await newUserFactory('', 'password123');

      await expect(createUser()).to.be.eventually.rejectedWith(ValidationError);
    });

    it('should create a new user with hashed password.', async () => {
      const hash = (t: string) => Promise.resolve('hashedPassword');
      const newUserFactory = makeNewUserFactory(hash as HashFunction);

      const user = await newUserFactory('email@email.com', 'password123');

      expect(user.password).to.equal('hashedPassword');
    });
  });
});
