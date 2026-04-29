import 'koa';
import type { JwtPayload } from './index';

declare module 'koa' {
  interface Request {
    body?: unknown;
  }

  interface DefaultState {
    user: JwtPayload;
  }
}
