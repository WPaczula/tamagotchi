import { Router } from 'express';
import { requireAuthentication } from '../../../middlewares';
import {
  makeCreatePetTypeHandler,
  makeGetPetTypesHandler,
} from '../controllers/petTypes';
import { makePetTypesRepository } from '../repositories/petTypes';
import { DBClient } from '../../../database';

/**
 * @swagger
 * tags:
 *  name: PetTypes
 *  description: Pet types
 */

/**
 * @swagger
 * definitions:
 *   NewPetType:
 *     type: object
 *     required:
 *       - name
 *     properties:
 *       name:
 *         type: string
 *         min: 2
 *         max: 255
 *         example: Capybara
 *
 *   PetType:
 *     type: object
 *     required:
 *      - id
 *      - name
 *     properties:
 *      id:
 *        type: integer
 *      name:
 *        type: string
 *        min: 2
 *        max: 255
 *        example: Capybara
 */

export const makePetTypeRoutes = (dbClient: DBClient) => {
  const router = Router();

  const petTypesRepository = makePetTypesRepository(dbClient);

  /**
   * @swagger
   * /petTypes:
   *  post:
   *    tags: [PetTypes]
   *    description: Use to create a new pet type
   *    parameters:
   *    - in: body
   *      name: pet type
   *      required: true
   *      type: object
   *      schema:
   *        $ref: '#/definitions/NewPetType'
   *    responses:
   *      '201':
   *        description: Successfully created
   *      '400':
   *        description: Pet type validation fails
   *      '409':
   *        description: Pet type name already exists
   */
  router.post(
    '/',
    requireAuthentication,
    makeCreatePetTypeHandler(petTypesRepository)
  );

  /**
   * @swagger
   * /petTypes:
   *  get:
   *    tags: [PetTypes]
   *    description: Use to request all pet types
   *    parameters:
   *      - in: query
   *        name: page
   *        type: integer
   *        description: Page number
   *      - in: query
   *        name: pageSize
   *        type: integer
   *        description: Page size
   *    responses:
   *      '200':
   *        description: Successfully fetched pet types
   *        schema:
   *          type: object
   *          properties:
   *            members:
   *              type: array
   *              items:
   *                $ref: '#/definitions/PetType'
   *            totalCount:
   *              type: integer
   *            prevPage:
   *              type: string
   *            nextPage:
   *              type: string
   */
  router.get(
    '/',
    requireAuthentication,
    makeGetPetTypesHandler(petTypesRepository)
  );

  return router;
};
