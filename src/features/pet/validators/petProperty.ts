import joi from 'joi';

export const newPetPropertySchema = joi.object({
  name: joi.string().trim().min(2).max(255).required(),
  value: joi.number().min(1).required(),
  weight: joi.number().min(1).required(),
  valuePerTime: joi.number().min(0.001).required(),
});
