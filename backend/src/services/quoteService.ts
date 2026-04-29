import { quoteModel } from '../models/Quote';
import { AppError } from '../utils/AppError';
import { logger } from '../utils/logger';
import { toExcel } from '../utils/excel';

class QuoteService {
  async createQuote(content: string, tagIds: number[] = [], newTagsName: string[] = [], userId: number) {
    try {
      const { quoteId } = await quoteModel.createQuoteWithTags(content, tagIds, newTagsName, userId);
      return { id: quoteId };
    } catch (error) {
      logger.error('创建摘抄失败', { error });
      throw AppError.internal('创建摘抄失败，请稍后重试');
    }
  }

  async getQuotes(
    page = 1,
    pageSize = 20,
    tagIds: string[] | null = null,
    keyword: string | null = null,
    userId: number,
  ) {
    try {
      return await quoteModel.getQuotes({
        page,
        pageSize,
        tagIds: tagIds ?? undefined,
        keyword: keyword ?? undefined,
        userId,
      });
    } catch (error) {
      logger.error('查询摘抄失败', { error });
      throw AppError.internal('查询摘抄失败，请稍后重试');
    }
  }

  async updateQuote(
    id: number,
    content: string,
    tagIds: number[] = [],
    newTagsName: string[] = [],
    userId: number,
  ) {
    try {
      await quoteModel.updateQuoteWithTags(id, content, tagIds, newTagsName, userId);
      return { id, tagIds, newTagsName };
    } catch (error) {
      if (error instanceof AppError) throw error;
      logger.error('更新摘抄失败', { error });
      throw AppError.internal('更新摘抄失败，请稍后重试');
    }
  }

  async exportQuotes(tagIds: string[] | null = null, userId: number) {
    try {
      const quotes = await quoteModel.getQuotesForExport(tagIds ?? undefined, userId);
      const rows = quotes.map((q) => ({
        content: q.content,
        tags: q.tags.map((t) => t.name).join(', '),
      }));
      const columns = [
        { header: '内容', key: 'content' },
        { header: '标签', key: 'tags' },
      ];
      return toExcel(rows, columns);
    } catch (error) {
      logger.error('导出摘抄失败', { error });
      throw AppError.internal('导出失败，请稍后重试');
    }
  }

  async deleteQuote(id: number, userId: number) {
    try {
      const changes = await quoteModel.deleteQuote(id, userId);
      if (changes === 0) {
        throw AppError.notFound('摘抄不存在', 2001);
      }
      return { success: true };
    } catch (error) {
      if (error instanceof AppError) throw error;
      logger.error('删除摘抄失败', { error });
      throw AppError.internal('删除摘抄失败');
    }
  }
}

const quoteService = new QuoteService();
export { quoteService, QuoteService };
