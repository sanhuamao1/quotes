import Joi from 'joi';

const rename = {
  body: Joi.object({
    id: Joi.number().integer().positive().required(),
    newName: Joi.string().min(1).max(50).required(),
  }),
};

const deleteParam = {
  params: Joi.object({
    id: Joi.number().integer().positive().required(),
  }),
};

export const tagSchema = { rename, deleteParam };
