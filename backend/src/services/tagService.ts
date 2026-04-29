import { tagModel } from '../models/Tag';
import { AppError } from '../utils/AppError';
import { logger } from '../utils/logger';

class TagService {
  async getTags(userId: number) {
    try {
      return await tagModel.getAllTags(userId);
    } catch (error) {
      logger.error('查询标签列表失败', { error });
      throw AppError.internal('查询标签列表失败');
    }
  }

  async deleteTag(tagId: number, userId: number) {
    try {
      return await tagModel.deleteTag(tagId, userId);
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      logger.error('删除标签失败', { error });
      throw AppError.internal('删除标签失败');
    }
  }

  async renameTag(tagId: number, newName: string, userId: number) {
    try {
      return await tagModel.renameTag(tagId, newName, userId);
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      logger.error('重命名标签失败', { error });
      throw AppError.internal('重命名标签失败');
    }
  }
}

const tagService = new TagService();
export { tagService, TagService };
