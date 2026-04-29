import { BaseModel } from './BaseModel';
import { AppError } from '../utils/AppError';
import { ErrorCode } from '../utils/errorCodes';

interface TagRecord {
  id: number;
  name: string;
  last_used_at: string;
}

interface TagWithCount extends TagRecord {
  count: number;
}

export interface TagResult {
  id: number;
  name: string;
  count: number;
  lastUsedAt: string;
}

class Tag extends BaseModel {
  constructor() {
    super('tags');
  }

  async getAllTags(userId: number): Promise<TagResult[]> {
    const tags = await this
      .query()
      .select('t.id', 't.name', 't.last_used_at')
      .count('qt.quote_id as count')
      .from('tags as t')
      .leftJoin('quote_tags as qt', 't.id', 'qt.tag_id')
      .where('t.user_id', userId)
      .groupBy('t.id')
      .orderBy('count', 'desc')
      .orderBy('t.name', 'asc');

    return (tags as TagWithCount[]).map((tag) => ({
      id: tag.id,
      name: tag.name,
      count: tag.count,
      lastUsedAt: tag.last_used_at,
    }));
  }

  async findByName(name: string, userId: number): Promise<TagRecord | undefined> {
    return this.query().where({ name, user_id: userId }).first() as Promise<TagRecord | undefined>;
  }

  async findByPk(id: number): Promise<TagRecord | undefined> {
    return this.findById(id) as Promise<TagRecord | undefined>;
  }

  async deleteTag(tagId: number, userId: number): Promise<{ id: number }> {
    const tag = await this.query().where({ id: tagId, user_id: userId }).first();
    if (!tag) {
      throw AppError.notFound(`标签 ID "${tagId}" 不存在`, ErrorCode.TAG_NOT_FOUND);
    }
    await this.delete(tagId);
    return { id: tagId };
  }

  async renameTag(tagId: number, newName: string, userId: number): Promise<{ id: number; name: string }> {
    const oldTag = await this.query().where({ id: tagId, user_id: userId }).first();
    if (!oldTag) {
      throw AppError.notFound(`标签 ID "${tagId}" 不存在`, ErrorCode.TAG_NOT_FOUND);
    }

    const existingTag = await this.findByName(newName, userId);
    if (existingTag) {
      throw AppError.conflict(`标签 "${newName}" 已存在`, ErrorCode.TAG_EXISTS);
    }

    await this.update(tagId, { name: newName, last_used_at: this.db.fn.now() });
    return { id: tagId, name: newName };
  }
}

const tagModel = new Tag();
export { tagModel, Tag };
