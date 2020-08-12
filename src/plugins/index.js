const config = require('config');

const Inert = require('@hapi/inert');
const Vision = require('@hapi/vision');
const HapiSwagger = require('hapi-swagger');
const Blipp = require('blipp');
const Good = require('good');

module.exports = [
  Inert,
  Vision,
  Blipp,
  {
    plugin: Good,
    options: config.goodConfig
  },
  {
    plugin: HapiSwagger,
    options: config.swaggerConfig
  }
];
