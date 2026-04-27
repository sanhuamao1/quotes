// 创建摘抄请求
export interface CreateQuoteRequest {
  content: string;
  tagIds: number[];
  newTagsName: string[]; // 新标签名称列表
}

// 更新摘抄请求
export interface UpdateQuoteRequest extends CreateQuoteRequest {
  id: number;
}

// 标签
export interface Tag {
  id: string;
  name: string;
  count?: number; // 使用次数
  color?: string; // 标签颜色
}

export interface Quote {
  id: string;
  content: string;
  tags: Tag[];
  updatedAt: string;
}

// 统计数据
export interface Stats {
  totalQuotes: number;
  totalTags: number;
}

export interface Pagination {
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export type ListApi<T, U> = (
  params: T & { page?: number; pageSize?: number }
) => Promise<{ list: U[]; pagination: Pagination }>;
