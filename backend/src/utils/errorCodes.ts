export const ErrorCode = {
  // Generic (1000-1999)
  SUCCESS: 0,
  UNKNOWN_ERROR: -1,
  UNAUTHORIZED: 1001,
  FORBIDDEN: 1002,
  VALIDATION_ERROR: 1003,
  NOT_FOUND: 1004,
  CONFLICT: 1005,
  INTERNAL_ERROR: 1999,

  // Quote domain (2000-2999)
  QUOTE_NOT_FOUND: 2001,

  // Tag domain (3000-3999)
  TAG_NOT_FOUND: 3001,
  TAG_EXISTS: 3002,
  TAG_HAS_QUOTES: 3003,
} as const;

export const ErrorMessage: Record<number, string> = {
  [ErrorCode.SUCCESS]: 'success',
  [ErrorCode.UNKNOWN_ERROR]: '未知错误',
  [ErrorCode.UNAUTHORIZED]: '未授权',
  [ErrorCode.FORBIDDEN]: '无权限',
  [ErrorCode.VALIDATION_ERROR]: '请求参数错误',
  [ErrorCode.NOT_FOUND]: '资源不存在',
  [ErrorCode.CONFLICT]: '资源冲突',
  [ErrorCode.INTERNAL_ERROR]: '服务器内部错误',
  [ErrorCode.QUOTE_NOT_FOUND]: '摘抄不存在',
  [ErrorCode.TAG_NOT_FOUND]: '标签不存在',
  [ErrorCode.TAG_EXISTS]: '标签已存在',
  [ErrorCode.TAG_HAS_QUOTES]: '标签下有关联的摘抄',
};
