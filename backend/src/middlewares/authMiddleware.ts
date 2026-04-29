import { Context, Next } from 'koa';
import jwt from 'jsonwebtoken';
import { config } from '../config';
import { AppError } from '../utils/AppError';
import type { JwtPayload } from '../types';

export async function authMiddleware(ctx: Context, next: Next) {
  const header = ctx.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    throw AppError.unauthorized('未登录，请先登录');
  }

  const token = header.slice(7);
  try {
    const payload = jwt.verify(token, config.jwt.secret) as JwtPayload;
    ctx.state.user = { userId: payload.userId, openid: payload.openid };
  } catch {
    throw AppError.unauthorized('登录已过期，请重新登录');
  }

  await next();
}
