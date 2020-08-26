import { Router } from 'express';
import { requireAuthentication } from '../../../middlewares';
import {
  makeCreatePetActionHandler,
  makeGetAllPetActions,
} from '../controllers/petAction';
import {
  makePetTypesRepository,
  makePetModifiersRepository,
  makePetActionsRepository,
} from '../repositories';
import { DBClient } from '../../../database';

/**
 * @swagger
 * tags:
 *  name: PetActions
 *  description: Pet actions
 */

/**
 * @swagger
 * definitions:
 *    NewPetAction:
 *      type: object
 *      required:
 *        - name
 *        - petTypeId
 *        - petModifierIds
 *      properties:
 *        name:
 *         type: string
 *         min: 2
 *         max: 255
 *         example: Feed
 *        petModifierIds:
 *         type: array
 *         items:
 *           type: integer
 *        petTypeId:
 *         type: integer
 *         min: 1
 *
 *    PetAction:
 *      type: object
 *      required:
 *        - id
 *        - name
 *        - petTypeId
 *        - petModifierIds
 *      properties:
 *        id:
 *         type: integer
 *         min: 1
 *        name:
 *         type: string
 *         min: 2
 *         max: 255
 *         example: Feed
 *        petModifierIds:
 *         type: array
 *         items:
 *           type: integer
 *        petTypeId:
 *         type: integer
 *         min: 1
 */

export const makePetActionsRoutes = (dbClient: DBClient) => {
  const router = Router();

  const petTypesRepository = makePetTypesRepository(dbClient);
  const petModifiersRepository = makePetModifiersRepository(dbClient);
  const petActionsRepository = makePetActionsRepository(dbClient);

  /**
   * @swagger
   * /petActions:
   *  post:
   *    tags: [PetActions]
   *    description: Use to create a new pet action
   *    parameters:
   *    - in: body
   *      name: pet action
   *      required: true
   *      type: object
   *      schema:
   *        $ref: '#/definitions/NewPetAction'
   *    responses:
   *      '201':
   *        description: Successfully created
   *      '400':
   *        description: Pet action validation fails
   *      '404':
   *        description: Pet type or pet modifier doesn't exist
   */
  router.post(
    '/',
    requireAuthentication,
    makeCreatePetActionHandler(
      petTypesRepository,
      petModifiersRepository,
      petActionsRepository
    )
  );

  /**
   * @swagger
   * /petActions:
   *  get:
   *    tags: [PetActions]
   *    description: Use to request all pet actions
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
   *        description: Successfully fetched pet actions
   *        schema:
   *          type: object
   *          properties:
   *            members:
   *              type: array
   *              items:
   *                $ref: '#/definitions/PetAction'
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
    makeGetAllPetActions(petActionsRepository)
  );

  return router;
};
