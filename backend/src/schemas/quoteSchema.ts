import Joi from 'joi';

const contentSchema = Joi.string().min(1).max(5000).required().messages({
  'string.empty': '摘抄内容不能为空',
  'string.min': '摘抄内容不能为空',
  'string.max': '内容长度不能超过 5000 字符',
  'any.required': '摘抄内容是必填项',
});

const tagIdsSchema = Joi.array().items(Joi.number().integer().positive()).optional().messages({
  'array.base': '标签ID必须是数组',
});

const newTagsNameSchema = Joi.array().items(Joi.string().min(1).max(50)).optional().messages({
  'array.base': '新标签名称必须是数组',
  'string.max': '标签长度不能超过 50 字符',
});

const create = {
  body: Joi.object({
    content: contentSchema,
    tagIds: tagIdsSchema,
    newTagsName: newTagsNameSchema,
  }),
};

const update = {
  body: Joi.object({
    content: contentSchema.optional(),
    tagIds: tagIdsSchema,
    newTagsName: newTagsNameSchema,
  }),
  params: Joi.object({
    id: Joi.number().integer().positive().required(),
  }),
};

const query = {
  query: Joi.object({
    page: Joi.number().integer().min(1).default(1).optional(),
    pageSize: Joi.number().integer().min(1).max(100).default(20).optional(),
    tagIds: Joi.string().optional(),
    keyword: Joi.string().max(100).optional(),
  }),
};

const deleteParam = {
  params: Joi.object({
    id: Joi.number().integer().positive().required().messages({
      'number.base': '摘抄ID必须是数字',
      'number.integer': '摘抄ID必须是整数',
      'number.positive': '摘抄ID必须是正整数',
      'any.required': '缺少摘抄ID',
    }),
  }),
};

export const quoteSchema = { create, update, query, deleteParam };
