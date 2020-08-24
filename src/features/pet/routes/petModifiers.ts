import { Router } from 'express';
import { makePetTypesRepository } from '../repositories';
import { DBClient } from '../../../database';
import { makePetModifiersRepository } from '../repositories/petModifier';
import { requireAuthentication } from '../../../middlewares';
import { makeCreatePetModifierHandler } from '../controllers/petModifier';

/**
 * @swagger
 * tags:
 *  name: PetModifiers
 *  description: Pet modifiers
 */

/**
 * @swagger
 * definitions:
 *    NewPetModifier:
 *      type: object
 *      required:
 *        - name
 *        - property
 *        - modifier
 *      properties:
 *        name:
 *          type: string
 *          min: 2
 *          max: 255
 *          example: food
 *        property:
 *          type: string
 *          min: 2
 *          max: 255
 *          example: hunger
 *          description: Property must exist on some pet type
 *        modifier:
 *          type: integer
 *          min: 1
 */
export const makePetModifiersRoutes = (dbClient: DBClient) => {
  const router = Router();

  const petTypesRepository = makePetTypesRepository(dbClient);
  const petModifiersRepository = makePetModifiersRepository(dbClient);

  /**
   * @swagger
   * /petModifiers:
   *  post:
   *    tags: [PetModifiers]
   *    description: Use to create a new pet modifier
   *    parameters:
   *    - in: body
   *      name: pet modifier
   *      required: true
   *      type: object
   *      schema:
   *        $ref: '#/definitions/NewPetModifier'
   *    responses:
   *      '201':
   *        description: Successfully created
   *      '400':
   *        description: Pet modifier validation fails
   */
  router.post(
    '/',
    requireAuthentication,
    makeCreatePetModifierHandler(petModifiersRepository, petTypesRepository)
  );

  return router;
};
