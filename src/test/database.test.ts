import initDBClient from '../database';

describe('Database', function () {
  it('Check database connection', async function () {
    await initDBClient();
  });
});
