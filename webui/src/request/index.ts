import Taro from '@tarojs/taro';
import { request } from './wrapper';
import type { Quote, Tag, Stats, CreateQuoteRequest, UpdateQuoteRequest, ListApi } from '../types';

// ==================== 摘抄接口 ====================

/**
 * 获取摘抄列表
 * GET /quotes?keyword=xxx&tagIds=1,2&page=1&pageSize=20
 */
export interface QuoteQueryParams {
  keyword?: string;
  tagIds?: number[];
}
export type GetQuotesApi = ListApi<QuoteQueryParams, Quote>;
export const getQuotes: GetQuotesApi = params => {
  const queryParams = new URLSearchParams();
  if (params?.keyword) queryParams.append('keyword', params.keyword);
  if (params?.tagIds?.length) queryParams.append('tagIds', params.tagIds.join(','));
  if (params?.page) queryParams.append('page', String(params.page));
  if (params?.pageSize) queryParams.append('pageSize', String(params.pageSize));

  const query = queryParams.toString();
  return request({ url: `/quotes${query ? `?${query}` : ''}`, method: 'GET' });
};

/**
 * 创建摘抄
 * POST /quotes
 */
export const createQuote = (data: CreateQuoteRequest): Promise<Quote> => {
  return request({ url: '/quotes', method: 'POST', data });
};

/**
 * 更新摘抄
 * PUT /quotes/:id
 */
export const updateQuote = (id: number, data: Partial<UpdateQuoteRequest>): Promise<Quote> => {
  return request({ url: `/quotes/${id}`, method: 'PUT', data });
};

/**
 * 删除摘抄
 * DELETE /quotes/:id
 */
export const deleteQuote = (id: number): Promise<void> => {
  return request({ url: `/quotes/${id}`, method: 'DELETE' });
};

// ==================== 标签接口 ====================

/**
 * 获取所有标签
 * GET /tags
 */
export const getTags = (): Promise<Tag[]> => {
  return request({ url: '/tags', method: 'GET' });
};

/**
 * 重命名标签
 * PUT /tags/rename
 */
export const renameTag = (id: number, newName: string): Promise<Tag> => {
  return request({
    url: '/tags/rename',
    method: 'PUT',
    data: { id, newName },
  });
};

/**
 * 删除标签
 * DELETE /tags/:id
 */
export const deleteTag = (id: number): Promise<void> => {
  return request({ url: `/tags/${id}`, method: 'DELETE' });
};

// ==================== 导出接口 ====================

/**
 * 导出摘抄为 Excel
 * GET /quotes/export?tagIds=1,2
 */
export const exportQuotes = async (tagIds: number[]): Promise<void> => {
  const token = Taro.getStorageSync('token');
  const baseUrl = process.env.TARO_APP_API_BASE_URL || 'http://localhost:3000/api';
  const params = new URLSearchParams();
  if (tagIds.length > 0) params.append('tagIds', tagIds.join(','));
  const query = params.toString();
  const url = `${baseUrl}/quotes/export${query ? `?${query}` : ''}`;
  const dateStr = new Date().toISOString().slice(0, 10);
  const filename = `quotes_export_${dateStr}.xlsx`;

  const res = await Taro.request({
    url,
    method: 'GET',
    responseType: 'arraybuffer',
    header: {
      ...(token && { Authorization: `Bearer ${token}` }),
    },
  });

  if (res.statusCode === 401) {
    Taro.removeStorageSync('token');
    throw new Error('登录已过期，请重启小程序');
  }

  if (res.statusCode < 200 || res.statusCode >= 300) {
    throw new Error('导出失败');
  }

  const data = res.data as ArrayBuffer;

  if (process.env.TARO_ENV === 'h5') {
    const blob = new Blob([data], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });
    const blobUrl = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = blobUrl;
    link.download = filename;
    link.style.display = 'none';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(blobUrl);
  } else {
    const fs = Taro.getFileSystemManager();
    const savedPath = `${Taro.env.USER_DATA_PATH}/${filename}`;
    await new Promise<void>((resolve, reject) => {
      fs.writeFile({
        filePath: savedPath,
        data,
        success() {
          resolve();
        },
        fail(err) {
          reject(new Error(err?.errMsg || '文件写入失败'));
        },
      });
    });
    await Taro.openDocument({
      filePath: savedPath,
      fileType: 'xlsx',
      showMenu: true,
    });
  }
};

// ==================== 统计接口 ====================

/**
 * 获取统计数据
 * GET /stats
 */
export const getStats = (): Promise<Stats> => {
  return request({ url: '/stats', method: 'GET' });
};
