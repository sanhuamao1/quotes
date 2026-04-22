const tagRepository = require("../repositories/tag");
const quoteRepository = require("../repositories/quote");
const BusinessError = require("../utils/BusinessError");

class TagService {
  async getTags() {
    try {
      const tags = await Promise.resolve(tagRepository.getAllTags());
      return tags;
    } catch (error) {
      throw new BusinessError("查询标签列表失败", -1, 500);
    }
  }

  async getQuotesByTag(tagId, page = 1, pageSize = 20) {
    try {
      const result = await Promise.resolve(
        quoteRepository.getQuotesByTagId(tagId, page, pageSize)
      );
      return result;
    } catch (error) {
      throw new BusinessError("查询标签下的摘抄失败", -1, 500);
    }
  }

  async renameTag(oldName, newName) {
    try {
      await Promise.resolve(
        tagRepository.renameTag(oldName, newName)
      );
    } catch (error) {
      throw new BusinessError("重命名标签失败", -1, 500);
    }
  }

  async getStats() {
    try {
      const stats = await Promise.resolve(
        tagRepository.getStats()
      );
      return stats;
    } catch (error) {
      throw new BusinessError("获取统计数据失败", -1, 500);
    }
  }
}

module.exports = new TagService();
