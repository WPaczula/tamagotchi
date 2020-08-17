import { Router } from 'express';
import { makeRegisterHandler, makeLoginHandler } from '../controllers';
import { DBClient } from '../../../database';
import { makeUsersRepository } from '../repositories';
import { makeNewUserFactory } from '../models/auth';
import { hash } from '../utils/hash';
import passport from 'passport';

/**
 * @swagger
 * tags:
 *  name: Auth
 *  description: Authorization
 */

/**
 * @swagger
 * definitions:
 *   NewUser:
 *     type: object
 *     required:
 *       - email
 *       - password
 *     properties:
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
 *   Credentials:
 *      type: object
 *      required:
 *        - email
 *        - password
 *      properties:
 *        email:
 *         type: string
 *         example: test@test.com
 *         format: email
 *        password:
 *         type: string
 *         example: password123
 */
export const makeAuthRoutes = (client: DBClient) => {
  const usersRepository = makeUsersRepository(client);
  const newUserFactory = makeNewUserFactory(hash);
  const router = Router();

  /**
   * @swagger
   * /register:
   *  post:
   *    tags: [Auth]
   *    description: Use to register a new user
   *    parameters:
   *      - name: user
   *        in: body
   *        required: true
   *        type: string
   *        schema:
   *          $ref: '#/definitions/NewUser'
   *    responses:
   *      '201':
   *        description: Successfully registered
   *      '400':
   *        description: Error if email already exists, email or password does not meet requirements
   */
  router.post(
    '/register',
    makeRegisterHandler(usersRepository, newUserFactory)
  );

  /**
   * @swagger
   * /login:
   *  post:
   *    tags: [Auth]
   *    description: Logs the user in
   *    parameters:
   *      - credentials: credentials
   *        in: body
   *        required: true
   *        type: string
   *        schema:
   *          $ref: '#/definitions/Credentials'
   *    responses:
   *      '204':
   *        description: Successfully registered
   *      '401':
   *        description: Wrong username or password
   */
  router.post('/login', passport.authenticate('local'), makeLoginHandler());

  return router;
};
