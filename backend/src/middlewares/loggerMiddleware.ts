import { Context, Next } from 'koa';
import { AppError } from '../utils/AppError';
import { logger } from '../utils/logger';

async function loggerMiddleware(ctx: Context, next: Next) {
  const start = Date.now();
  logger.info(`${ctx.method} ${ctx.url}`);

  try {
    await next();
    const ms = Date.now() - start;
    logger.info(`${ctx.method} ${ctx.url} -> ${ctx.status} (${ms}ms)`);
  } catch (error) {
    const ms = Date.now() - start;
    const status = error instanceof AppError ? error.httpStatus : ctx.status || 500;
    logger.error(`${ctx.method} ${ctx.url} -> ${status} (${ms}ms)`);
    throw error;
  }
}

export { loggerMiddleware };
