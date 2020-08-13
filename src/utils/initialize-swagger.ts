import config from 'config';
import swaggerJsDoc from 'swagger-jsdoc';
import swaggerUI from 'swagger-ui-express';
import { Express } from 'express';

const initializeSwagger = (app: Express) => {
  const swaggerConfig = config.get('swaggerConfig') as swaggerJsDoc.Options;
  const swaggerDocs = swaggerJsDoc(swaggerConfig);

  app.use('/api-docs', swaggerUI.serve, swaggerUI.setup(swaggerDocs));
};

export default initializeSwagger;
