import { request } from "./wrapper";
import type {
  Quote,
  Tag,
  Stats,
  CreateQuoteRequest,
  UpdateQuoteRequest,
  ListApi,
} from "../types";

// ==================== 摘抄接口 ====================

/**
 * 获取摘抄列表
 * GET /quotes?keyword=xxx&tagIds=1,2&page=1&pageSize=20
 */
export interface QuoteQueryParams {
  keyword?: string;
  tagIds?: string[];
}
export type GetQuotesApi = ListApi<QuoteQueryParams, Quote>;
export const getQuotes: GetQuotesApi = (params) => {
  const queryParams = new URLSearchParams();
  if (params?.keyword) queryParams.append("keyword", params.keyword);
  if (params?.tagIds?.length)
    queryParams.append("tagIds", params.tagIds.join(","));
  if (params?.page) queryParams.append("page", String(params.page));
  if (params?.pageSize) queryParams.append("pageSize", String(params.pageSize));

  const query = queryParams.toString();
  return request({ url: `/quotes${query ? `?${query}` : ""}`, method: "GET" });
};

/**
 * 创建摘抄
 * POST /quotes
 */
export const createQuote = (data: CreateQuoteRequest): Promise<Quote> => {
  return request({ url: "/quotes", method: "POST", data });
};

/**
 * 获取单个摘抄
 * GET /quotes/:id
 */
export const getQuote = (id: string): Promise<Quote> => {
  return request({ url: `/quotes/${id}`, method: "GET" });
};

/**
 * 更新摘抄
 * PUT /quotes/:id
 */
export const updateQuote = (
  id: number,
  data: Partial<UpdateQuoteRequest>,
): Promise<Quote> => {
  return request({ url: `/quotes/${id}`, method: "PUT", data });
};

/**
 * 删除摘抄
 * DELETE /quotes/:id
 */
export const deleteQuote = (id: string): Promise<void> => {
  return request({ url: `/quotes/${id}`, method: "DELETE" });
};

// ==================== 标签接口 ====================

/**
 * 获取所有标签
 * GET /tags
 */
export const getTags = (): Promise<Tag[]> => {
  return request({ url: "/tags", method: "GET" });
};

/**
 * 获取标签下的摘抄
 * GET /tags/:id/quotes
 */
export const getQuotesByTag = (tagId: string): Promise<Quote[]> => {
  return request({ url: `/tags/${tagId}/quotes`, method: "GET" });
};

/**
 * 重命名标签
 * PUT /tags/rename
 */
export const renameTag = (oldName: string, newName: string): Promise<void> => {
  return request({
    url: "/tags/rename",
    method: "PUT",
    data: { oldName, newName },
  });
};

// ==================== 统计接口 ====================

/**
 * 获取统计数据
 * GET /stats
 */
export const getStats = (): Promise<Stats> => {
  return request({ url: "/stats", method: "GET" });
};
