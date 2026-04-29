class AppError extends Error {
  public readonly code: number;
  public readonly httpStatus: number;
  public readonly isOperational: boolean;

  constructor(message: string, code: number, httpStatus = 400, isOperational = true) {
    super(message);
    this.code = code;
    this.httpStatus = httpStatus;
    this.isOperational = isOperational;
    Object.setPrototypeOf(this, AppError.prototype);
  }

  static notFound(message = '资源不存在', code = 1004) {
    return new AppError(message, code, 404);
  }

  static conflict(message = '资源冲突', code = 1005) {
    return new AppError(message, code, 409);
  }

  static validation(message = '请求参数错误', code = 1003) {
    return new AppError(message, code, 400);
  }

  static unauthorized(message = '未授权', code = 1001) {
    return new AppError(message, code, 401);
  }

  static forbidden(message = '无权限', code = 1002) {
    return new AppError(message, code, 403);
  }

  static internal(message = '服务器内部错误', code = 1999) {
    return new AppError(message, code, 500, false);
  }
}

export { AppError };
