const handlers = require('./../handlers');

module.exports = [
  {
    method: 'GET',
    path: '/',
    options: {
      handler: handlers.home,
      description: 'Home route',
      notes: 'Returns simple string',
      tags: ['api']
    }
  },
  {
    method: 'GET',
    path: '/example',
    options: {
      handler: handlers.example,
      description: 'Example route',
      notes: 'Returns json',
      tags: ['api', 'test']
    }
  }
];
