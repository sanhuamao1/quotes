import { BaseModel } from './BaseModel';
import { AppError } from '../utils/AppError';
import { ErrorCode } from '../utils/errorCodes';

export interface QuoteRow {
  id: number;
  content: string;
  updated_at: string;
}

interface TagInfo {
  id: number;
  name: string;
}

interface QuoteWithTags {
  id: number;
  content: string;
  tags: TagInfo[];
  updatedAt: string;
}

interface PaginationInfo {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

export interface QuoteListResult {
  list: QuoteWithTags[];
  pagination: PaginationInfo;
}

class Quote extends BaseModel {
  constructor() {
    super('quotes');
  }

  async createQuoteWithTags(
    content: string,
    tagIds: number[],
    newTagsName: string[],
    userId: number,
  ): Promise<{ quoteId: number }> {
    return this.db.transaction(async (trx) => {
      const [quoteId] = await trx('quotes').insert({ content, user_id: userId });

      for (const tagName of newTagsName) {
        await trx('tags').insert({ name: tagName, user_id: userId }).onConflict(['user_id', 'name']).ignore();
        const tag = await trx('tags').where({ name: tagName, user_id: userId }).select('id').first();
        if (tag) {
          await trx('tags').where({ id: tag.id }).update({ last_used_at: trx.fn.now() });
          await trx('quote_tags').insert({ quote_id: quoteId, tag_id: tag.id }).onConflict(['quote_id', 'tag_id']).ignore();
        }
      }

      for (const tagId of tagIds) {
        // Verify tag belongs to user
        const tag = await trx('tags').where({ id: tagId, user_id: userId }).first();
        if (tag) {
          await trx('tags').where({ id: tagId }).update({ last_used_at: trx.fn.now() });
          await trx('quote_tags').insert({ quote_id: quoteId, tag_id: tagId }).onConflict(['quote_id', 'tag_id']).ignore();
        }
      }

      return { quoteId: quoteId as number };
    });
  }

  async getQuotes({
    page = 1,
    pageSize = 20,
    tagIds,
    keyword,
    userId,
  }: {
    page?: number;
    pageSize?: number;
    tagIds?: string[];
    keyword?: string;
    userId: number;
  }): Promise<QuoteListResult> {
    const offset = (page - 1) * pageSize;
    const hasTagFilter = tagIds && tagIds.length > 0;

    // Build base query
    let baseQuery = this.db('quotes').where('quotes.user_id', userId);

    if (hasTagFilter) {
      baseQuery = baseQuery
        .join('quote_tags', 'quotes.id', 'quote_tags.quote_id')
        .whereIn('quote_tags.tag_id', tagIds as string[])
        .groupBy('quotes.id')
        .havingRaw(`COUNT(DISTINCT quote_tags.tag_id) = ${tagIds!.length}`);
    }

    if (keyword) {
      baseQuery = hasTagFilter
        ? baseQuery.andWhere('quotes.content', 'like', `%${keyword}%`)
        : baseQuery.where('quotes.content', 'like', `%${keyword}%`);
    }

    // Count query
    const countBuilder = hasTagFilter
      ? baseQuery.clone().clearSelect().countDistinct({ total: 'quotes.id' }).first()
      : baseQuery.clone().clearSelect().countDistinct({ total: 'quotes.id' }).first();

    // Main query with pagination
    const mainBuilder = baseQuery.clone().select('quotes.*')
      .orderBy('quotes.updated_at', 'desc')
      .limit(pageSize)
      .offset(offset);

    const [countResult, quotes] = await Promise.all([
      countBuilder,
      mainBuilder,
    ]);

    const total = (countResult as { total: number } | undefined)?.total ?? 0;

    // Get tags for all quotes
    const quoteRows = quotes as QuoteRow[];
    const list = quoteRows.length > 0
      ? await this.attachTagsToQuotes(quoteRows)
      : [];

    return {
      list,
      pagination: {
        page,
        pageSize,
        total,
        totalPages: Math.ceil(total / pageSize),
      },
    };
  }

  private async attachTagsToQuotes(quotes: QuoteRow[]): Promise<QuoteWithTags[]> {
    const ids = quotes.map((q) => q.id);
    const placeholders = ids.map(() => '?').join(',');
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const rows: any[] = await this.db.raw(
      `SELECT qt.quote_id, t.id, t.name FROM tags t JOIN quote_tags qt ON t.id = qt.tag_id WHERE qt.quote_id IN (${placeholders})`,
      ids,
    );

    const tagsMap = new Map<number, TagInfo[]>();
    for (const row of rows) {
      if (!tagsMap.has(row.quote_id)) {
        tagsMap.set(row.quote_id, []);
      }
      tagsMap.get(row.quote_id)!.push({ id: row.id, name: row.name });
    }

    return quotes.map((quote) => ({
      id: quote.id,
      content: quote.content,
      tags: tagsMap.get(quote.id) || [],
      updatedAt: quote.updated_at,
    }));
  }

  async getQuotesForExport(tagIds: string[] | undefined, userId: number): Promise<{ content: string; tags: TagInfo[]; updatedAt: string }[]> {
    let query = this.db('quotes').where('quotes.user_id', userId);

    if (tagIds && tagIds.length > 0) {
      query = query
        .join('quote_tags', 'quotes.id', 'quote_tags.quote_id')
        .whereIn('quote_tags.tag_id', tagIds)
        .groupBy('quotes.id')
        .havingRaw(`COUNT(DISTINCT quote_tags.tag_id) = ${tagIds.length}`);
    }

    const quotes = await query.clone().select('quotes.*').orderBy('quotes.updated_at', 'desc') as QuoteRow[];

    if (quotes.length === 0) return [];

    const ids = quotes.map((q) => q.id);
    const placeholders = ids.map(() => '?').join(',');
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const rows: any[] = await this.db.raw(
      `SELECT qt.quote_id, t.id, t.name FROM tags t JOIN quote_tags qt ON t.id = qt.tag_id WHERE qt.quote_id IN (${placeholders})`,
      ids,
    );

    const tagsMap = new Map<number, TagInfo[]>();
    for (const row of rows) {
      if (!tagsMap.has(row.quote_id)) {
        tagsMap.set(row.quote_id, []);
      }
      tagsMap.get(row.quote_id)!.push({ id: row.id, name: row.name });
    }

    return quotes.map((quote) => ({
      content: quote.content,
      tags: tagsMap.get(quote.id) || [],
      updatedAt: quote.updated_at,
    }));
  }

  async updateQuoteWithTags(
    id: number,
    content: string,
    tagIds: number[],
    newTagsName: string[],
    userId: number,
  ): Promise<void> {
    // Check existence first to avoid Knex transaction error wrapping
    const existing = await this.db('quotes').where({ id, user_id: userId }).first();
    if (!existing) {
      throw AppError.notFound(`摘抄 ID ${id} 不存在`, ErrorCode.QUOTE_NOT_FOUND);
    }

    await this.db.transaction(async (trx) => {
      await trx('quotes').where({ id }).update({ content, updated_at: trx.fn.now() });

      // Delete existing tag associations
      await trx('quote_tags').where({ quote_id: id }).delete();

      // Process new tag names
      const allTagIds = [...tagIds];
      for (const tagName of newTagsName) {
        await trx('tags').insert({ name: tagName, user_id: userId }).onConflict(['user_id', 'name']).ignore();
        const tag = await trx('tags').where({ name: tagName, user_id: userId }).select('id').first();
        if (tag) {
          allTagIds.push(tag.id);
        }
      }

      // Insert tag associations
      for (const tagId of allTagIds) {
        await trx('quote_tags').insert({ quote_id: id, tag_id: tagId }).onConflict(['quote_id', 'tag_id']).ignore();
        await trx('tags').where({ id: tagId }).update({ last_used_at: trx.fn.now() });
      }
    });
  }

  async deleteQuote(id: number, userId: number): Promise<number> {
    return this.db.transaction(async (trx) => {
      const existing = await trx('quotes').where({ id, user_id: userId }).first();
      if (!existing) return 0;
      await trx('quote_tags').where({ quote_id: id }).delete();
      const result = await trx('quotes').where({ id }).delete();
      return result;
    });
  }
}

const quoteModel = new Quote();
export { quoteModel, Quote };
