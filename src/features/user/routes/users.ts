import { Router } from 'express';
import { makeGetUsersHandler } from '../controllers';
import { DBClient } from '../../../database';
import { makeUsersRepository } from '../repositories';
import { authenticated } from '../middlewares/auth';

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
   *    parameters:
   *      - in: query
   *        name: page
   *        type: integer
   *        description: Page number
   *      - in: query
   *        name: pageSize
   *        type: integer
   *        description: Page size
   *      - in: query
   *        name: email
   *        type: string
   *        description: Email filter
   *      - in: query
   *        name: firstName
   *        type: string
   *        description: First name filter
   *      - in: query
   *        name: lastName
   *        type: string
   *        description: Last name filter
   *    responses:
   *      '200':
   *        description: Successfully fetched users
   *        schema:
   *          type: object
   *          properties:
   *            members:
   *              type: array
   *              items:
   *                $ref: '#/definitions/User'
   *            totalCount:
   *              type: integer
   *            prevPage:
   *              type: string
   *            nextPage:
   *              type: string
   */
  router.get('/', authenticated, makeGetUsersHandler(usersRepository));

  return router;
};
