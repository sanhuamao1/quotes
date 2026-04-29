import type { ResponseBody } from '../types';

class Response {
  static success<T>(ctx: { body: unknown; status?: number }, data: T | null = null, message = 'success') {
    const body: ResponseBody<T> = { code: 0, message };
    if (data !== null) {
      body.data = data;
    }
    ctx.body = body;
  }

  static error(
    ctx: { body: unknown; status?: number },
    message = 'error',
    code = -1,
    status = 200,
  ) {
    ctx.status = status;
    ctx.body = { code, message } as ResponseBody;
  }
}

export { Response };
