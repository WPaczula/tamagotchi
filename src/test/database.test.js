const config = require('config');
const { Client } = require('pg');

describe('Database', function () {
  it('Check database connection 123', async function () {
    const client = new Client(config.dbConfig);

    await client.connect();
  });
});
