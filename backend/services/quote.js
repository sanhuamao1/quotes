const quoteRepository = require("../repositories/quote");
const BusinessError = require("../utils/BusinessError");

class QuoteService {
  async createQuote(content, tagIds = [], newTagsName = []) {
    try {
      const { quoteId } = await Promise.resolve(
        quoteRepository.createQuoteWithTags(content, tagIds, newTagsName),
      );
      return { id: quoteId };
    } catch (error) {
      throw new BusinessError("创建摘抄失败，请稍后重试", -1, 500);
    }
  }

  async getQuotes(page = 1, pageSize = 20, tagIds = null, keyword = null) {
    try {
      const result = await Promise.resolve(
        quoteRepository.getQuotesWithTags({ page, pageSize, tagIds, keyword }),
      );
      return result;
    } catch (error) {
      throw new BusinessError("查询摘抄失败，请稍后重试", -1, 500);
    }
  }

  async getQuoteById(id) {
    try {
      const quote = await Promise.resolve(quoteRepository.getQuoteWithTags(id));
      if (!quote) {
        throw new BusinessError("摘抄不存在", -1, 404);
      }
      return quote;
    } catch (error) {
      if (error instanceof BusinessError) throw error;
      throw new BusinessError("查询摘抄详情失败", -1, 500);
    }
  }

  async updateQuote(id, content, tagIds = [], newTagsName = []) {
    try {
      const changes = await Promise.resolve(
        quoteRepository.updateQuoteWithTags(id, content, tagIds, newTagsName),
      );
      if (changes === 0) {
        throw new BusinessError("摘抄不存在", -1, 404);
      }
      return { id, tagIds, newTagsName };
    } catch (error) {
      if (error instanceof BusinessError) throw error;
      throw new BusinessError("更新摘抄失败，请稍后重试", -1, 500);
    }
  }

  async deleteQuote(id) {
    try {
      const changes = await Promise.resolve(quoteRepository.deleteQuote(id));
      if (changes === 0) {
        throw new BusinessError("摘抄不存在", -1, 404);
      }
      return { success: true };
    } catch (error) {
      if (error instanceof BusinessError) throw error;
      throw new BusinessError("删除摘抄失败", -1, 500);
    }
  }
}

module.exports = new QuoteService();
