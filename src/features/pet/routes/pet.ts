import { Router } from 'express';
import {
  makePetTypesRepository,
  makePetActionsRepository,
  makePetModifiersRepository,
} from '../repositories';
import { DBClient } from '../../../database';
import { requireAuthentication } from '../../../middlewares';
import { makePetsRepository } from '../repositories/pet';
import {
  makeCreatePetHandler,
  makeGetPetHandler,
  makeApplyActionHandler,
} from '../controllers/pet';
import { makePetsHealthService } from '../services/pet-health';
import { makePetPropertiesRepository } from '../repositories/petProperty';
import { makeDateService } from '../utils/date';
import { makePetActionsService } from '../services/pet-action';

/**
 * @swagger
 * tags:
 *  name: Pets
 *  description: Pets
 */

/**
 * @swagger
 * definitions:
 *    NewPet:
 *      type: object
 *      required:
 *        - name
 *        - petTypeId
 *      properties:
 *        name:
 *          type: string
 *          min: 2
 *          max: 255
 *          example: food
 *        petTypeId:
 *          type: integer
 *          min: 1
 */
export const makePetsRoutes = (dbClient: DBClient) => {
  const router = Router();

  const petTypesRepository = makePetTypesRepository(dbClient);
  const petsRepository = makePetsRepository(dbClient);
  const petPropertiesRepository = makePetPropertiesRepository(dbClient);
  const petActionsRepository = makePetActionsRepository(dbClient);
  const petModifiersRepository = makePetModifiersRepository(dbClient);
  const petActionsService = makePetActionsService(
    petPropertiesRepository,
    petModifiersRepository
  );
  const petHealthService = makePetsHealthService(
    petPropertiesRepository,
    makeDateService()
  );

  /**
   * @swagger
   * /pets:
   *  post:
   *    tags: [Pets]
   *    description: Use to create a new pet
   *    parameters:
   *    - in: body
   *      name: pet
   *      required: true
   *      type: object
   *      schema:
   *        $ref: '#/definitions/NewPet'
   *    responses:
   *      '201':
   *        description: Successfully created
   *      '400':
   *        description: Pet validation fails
   *      '404':
   *        description: Pet type not found
   */
  router.post(
    '/',
    requireAuthentication,
    makeCreatePetHandler(petTypesRepository, petsRepository)
  );

  /**
   * @swagger
   * /pets/:id:
   *  get:
   *    tags: [Pets]
   *    description: Use to get current pets status
   *    parameters:
   *    - in: query
   *      name: id
   *      required: true
   *      type: integer
   *    responses:
   *      '200':
   *        description: Pet state
   *      '404':
   *        description: No pet found
   *      '400':
   *        description: Pet id validation failed
   */
  router.get(
    '/:id',
    requireAuthentication,
    makeGetPetHandler(petsRepository, petHealthService)
  );

  /**
   * @swagger
   * /pets/:petId/actions/:actionId:
   *  post:
   *    tags: [Pets]
   *    description: Use to apply an action to a pet
   *    parameters:
   *    - in: query
   *      name: petId
   *      required: true
   *      type: integer
   *      min: 1
   *    - in: query
   *      name: actionId
   *      required: true
   *      type: integer
   *      min: 1
   *    responses:
   *      '204':
   *        description: Successfully applied
   *      '400':
   *        description: Id validation fails
   *      '404':
   *        description: Pet or action not found
   */
  router.post(
    '/:petId/actions/:actionId',
    requireAuthentication,
    makeApplyActionHandler(
      petsRepository,
      petActionsRepository,
      petActionsService
    )
  );

  return router;
};
