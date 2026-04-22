const Joi = require("joi");

const contentSchema = Joi.string().required().min(1).max(5000).messages({
  "string.empty": "摘抄内容不能为空",
  "string.min": "摘抄内容不能为空",
  "string.max": "内容长度不能超过 5000 字符",
  "any.required": "摘抄内容是必填项",
});

const tagsSchema = Joi.array()
  .items(Joi.string().min(1).max(50))
  .optional()
  .messages({
    "array.base": "标签必须是数组",
    "string.min": "标签不能为空",
    "string.max": "标签长度不能超过 50 字符",
  });

const createSchema = Joi.object({
  content: contentSchema,
  tags: tagsSchema,
});

const updateSchema = Joi.object({
  content: contentSchema.optional(),
  tags: tagsSchema,
});

const querySchema = Joi.object({
  page: Joi.number().integer().min(1).default(1).optional(),
  pageSize: Joi.number().integer().min(1).max(100).default(20).optional(),
  tagIds: Joi.string().optional(),
  keyword: Joi.string().max(100).optional(),
});

const idParamSchema = Joi.object({
  id: Joi.number().integer().positive().required().messages({
    "number.base": "摘抄ID必须是数字",
    "number.integer": "摘抄ID必须是整数",
    "number.positive": "摘抄ID必须是正整数",
    "any.required": "缺少摘抄ID",
  }),
});

module.exports = {
  createSchema,
  updateSchema,
  querySchema,
  idParamSchema,
};
