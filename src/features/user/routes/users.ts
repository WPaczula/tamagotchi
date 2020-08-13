import { Router } from 'express';
import { makeGetUsersHandler } from '../controllers';
import { DBClient } from '../../../database';
import { makeUsersRepository } from '../repositories';

/**
 * @swagger
 * tags:
 *  name: Users
 *  description: User management
 */

/**
 * @swagger
 * definitions:
 *   User:
 *     type: object
 *     required:
 *       - id
 *       - email
 *       - password
 *     properties:
 *       id:
 *         type: integer
 *       email:
 *         type: string
 *         max: 255
 *         example: test@test.com
 *         format: email
 *       password:
 *         type: string
 *         min: 7
 *         max: 255
 *         example: password123
 *       firstName:
 *         min: 2
 *         max: 255
 *         type: string
 *       lastName:
 *         min: 2
 *         max: 255
 *         type: string
 */
export const makeUsersRoutes = (client: DBClient) => {
  const usersRepository = makeUsersRepository(client);
  const router = Router();

  /**
   * @swagger
   * /users:
   *  get:
   *    tags: [Users]
   *    description: Use to request all users
   *    responses:
   *      '200':
   *        description: Successfully fetched users
   *        schema:
   *          type: array
   *          items:
   *            $ref: '#/definitions/User'
   */
  router.get('/', makeGetUsersHandler(usersRepository));

  return router;
};
