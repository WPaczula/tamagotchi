import initDBClient from './database';
import makeServer from './app';

const init = async () => {
  try {
    const client = await initDBClient();
    await makeServer(client);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

init();
