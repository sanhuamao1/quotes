// middlewares/validate.js
const BusinessError = require("../utils/BusinessError");

/**
 * 校验请求体 (ctx.request.body)
 */
function validateBody(schema) {
  return async (ctx, next) => {
    const { error, value } = schema.validate(ctx.request.body, {
      abortEarly: false, // 返回所有错误
      stripUnknown: true, // 删除未知字段
    });
    if (error) {
      const message = error.details.map((d) => d.message).join("; ");
      throw new BusinessError(message, -1, 400);
    }
    ctx.request.body = value; // 使用净化后的数据
    await next();
  };
}

/**
 * 校验查询参数 (ctx.query)
 */
function validateQuery(schema) {
  return async (ctx, next) => {
    const { error, value } = schema.validate(ctx.query, {
      abortEarly: false,
      stripUnknown: true,
    });
    if (error) {
      const message = error.details.map((d) => d.message).join("; ");
      throw new BusinessError(message, -1, 400);
    }
    ctx.query = value;
    await next();
  };
}

/**
 * 校验路由参数 (ctx.params)
 */
function validateParams(schema) {
  return async (ctx, next) => {
    const { error, value } = schema.validate(ctx.params, {
      abortEarly: false,
      stripUnknown: true,
    });
    if (error) {
      const message = error.details.map((d) => d.message).join("; ");
      throw new BusinessError(message, -1, 400);
    }
    ctx.params = value;
    await next();
  };
}

module.exports = {
  validateBody,
  validateQuery,
  validateParams,
};
