// ===== Business Domain Types =====

export interface Quote {
  id: number;
  content: string;
  updated_at: string;
  tags?: Tag[];
}

export interface Tag {
  id: number;
  name: string;
  last_used_at?: string;
  count?: number;
}

export interface QuoteTag {
  id: number;
  quote_id: number;
  tag_id: number;
}

// ===== API Types =====

export interface Pagination {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

export interface QuoteQueryParams {
  page?: number;
  pageSize?: number;
  tagIds?: string;
  keyword?: string;
}

export interface QuoteListResponse {
  quotes: Quote[];
  pagination: Pagination;
}

// ===== App Types =====

export interface User {
  id: number;
  openid: string;
  nickname?: string;
  avatar_url?: string;
  created_at?: string;
  updated_at?: string;
}

export interface JwtPayload {
  userId: number;
  openid: string;
}

export interface AppConfig {
  port: number;
  env: string;
  db: {
    path: string;
  };
  wechat: {
    appId: string;
    appSecret: string;
  };
  jwt: {
    secret: string;
    expiresIn: string;
  };
  upload?: {
    dir: string;
    maxFileSize: number;
    allowedMimeTypes: string[];
  };
}

export interface ResponseBody<T = unknown> {
  code: number;
  message: string;
  data?: T;
}

export interface PaginationQuery {
  page: number;
  pageSize: number;
}
