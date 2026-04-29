import { Context, Next } from 'koa';
import { AppError } from '../utils/AppError';
import { Response } from '../utils/Response';
import { ErrorCode } from '../utils/errorCodes';
import { logger } from '../utils/logger';

async function errorHandler(ctx: Context, next: Next) {
  try {
    await next();
  } catch (error) {
    if (error instanceof AppError) {
      if (error.httpStatus >= 500) {
        logger.error(`${error.message}`, { code: error.code, stack: error.stack });
      } else {
        logger.warn(`${error.message}`, { code: error.code });
      }
      Response.error(ctx, error.message, error.code, error.httpStatus);
    } else {
      const message = error instanceof Error ? error.message : '服务器内部错误';
      logger.error(`未捕获异常: ${message}`, {
        error: error instanceof Error ? error.stack : String(error),
      });
      Response.error(ctx, '服务器内部错误', ErrorCode.INTERNAL_ERROR, 500);
    }
  }
}

export { errorHandler };
