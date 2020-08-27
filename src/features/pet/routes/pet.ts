import { Router } from 'express';
import { makePetTypesRepository } from '../repositories';
import { DBClient } from '../../../database';
import { requireAuthentication } from '../../../middlewares';
import { makePetsRepository } from '../repositories/pet';
import { makeCreatePetHandler } from '../controllers/pet';

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

  return router;
};
