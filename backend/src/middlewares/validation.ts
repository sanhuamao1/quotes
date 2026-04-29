import { Context, Next } from 'koa';
import Joi from 'joi';
import { AppError } from '../utils/AppError';
import { ErrorCode } from '../utils/errorCodes';

interface ValidationSchemas {
  body?: Joi.ObjectSchema;
  query?: Joi.ObjectSchema;
  params?: Joi.ObjectSchema;
}

function validate(schemas: ValidationSchemas) {
  return async (ctx: Context, next: Next) => {
    try {
      if (schemas.body && ctx.request.body) {
        const { error, value } = schemas.body.validate(ctx.request.body, {
          abortEarly: false,
          stripUnknown: true,
        });
        if (error) {
          const messages = error.details.map((d) => d.message).join('; ');
          throw AppError.validation(messages, ErrorCode.VALIDATION_ERROR);
        }
        ctx.request.body = value;
      }

      if (schemas.query && ctx.query) {
        const { error, value } = schemas.query.validate(ctx.query, {
          abortEarly: false,
          stripUnknown: true,
        });
        if (error) {
          const messages = error.details.map((d) => d.message).join('; ');
          throw AppError.validation(messages, ErrorCode.VALIDATION_ERROR);
        }
        ctx.query = value;
      }

      if (schemas.params) {
        const { error, value } = schemas.params.validate(ctx.params, {
          abortEarly: false,
          stripUnknown: true,
        });
        if (error) {
          const messages = error.details.map((d) => d.message).join('; ');
          throw AppError.validation(messages, ErrorCode.VALIDATION_ERROR);
        }
        ctx.params = value;
      }

      await next();
    } catch (err) {
      if (err instanceof AppError) {
        throw err;
      }
      throw AppError.validation('请求参数验证失败', ErrorCode.VALIDATION_ERROR);
    }
  };
}

export { validate };
