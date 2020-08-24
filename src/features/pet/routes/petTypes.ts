import { Router } from 'express';
import { requireAuthentication } from '../../../middlewares';
import {
  makeCreatePetTypeHandler,
  makeGetPetTypesHandler,
} from '../controllers/petTypes';
import { makePetTypesRepository } from '../repositories';
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
 *    NewPetProperty:
 *      type: object
 *      required:
 *        - name
 *        - value
 *        - weight
 *        - valuePerTime
 *      properties:
 *        name:
 *          type: string
 *          min: 2
 *          max: 255
 *          example: hunger
 *        value:
 *          type: number
 *          min: 1
 *        weight:
 *          type: integer
 *          min: 1
 *        valuePerTime:
 *          type: number
 *          min: 0.001
 *
 *    NewPetType:
 *      type: object
 *      required:
 *        - name
 *      properties:
 *        name:
 *         type: string
 *         min: 2
 *         max: 255
 *         example: Capybara
 *        properties:
 *         type: array
 *         items:
 *           $ref: '#/definitions/NewPetProperty'
 *
 *    PetProperty:
 *      type: object
 *      required:
 *        - id
 *        - name
 *        - value
 *        - weight
 *        - valuePerTime
 *      properties:
 *        id:
 *          type: integer
 *        name:
 *          type: string
 *          min: 2
 *          max: 255
 *          example: hunger
 *        value:
 *          type: number
 *          min: 1
 *        weight:
 *          type: integer
 *          min: 1
 *        valuePerTime:
 *          type: number
 *          min: 0.001
 *
 *    PetType:
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
 *      properties:
 *         type: array
 *         items:
 *           $ref: '#/definitions/PetProperty'
 *
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
