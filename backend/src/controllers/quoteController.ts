import { Context } from 'koa';
import { quoteService } from '../services/quoteService';
import { Response } from '../utils/Response';

class QuoteController {
  async list(ctx: Context) {
    const { page = 1, pageSize = 20, tagIds, keyword } = ctx.query as Record<string, string>;
    const { userId } = ctx.state.user;

    // Process tagIds: comma-separated string
    let processedTagIds: string[] | null = null;
    if (tagIds !== undefined && tagIds !== null && tagIds !== '') {
      processedTagIds = String(tagIds)
        .split(',')
        .map((id) => id.trim())
        .filter((id) => id.length > 0);
    }

    const result = await quoteService.getQuotes(
      Number(page),
      Number(pageSize),
      processedTagIds,
      keyword as string | undefined,
      userId,
    );
    Response.success(ctx, result);
  }

  async create(ctx: Context) {
    const { content, tagIds = [], newTagsName = [] } = ctx.request.body as {
      content: string;
      tagIds?: number[];
      newTagsName?: string[];
    };
    const { userId } = ctx.state.user;
    const result = await quoteService.createQuote(content, tagIds, newTagsName, userId);
    Response.success(ctx, result, '摘抄创建成功');
  }

  async update(ctx: Context) {
    const { id } = ctx.params as { id: string };
    const { content, tagIds = [], newTagsName = [] } = ctx.request.body as {
      content: string;
      tagIds?: number[];
      newTagsName?: string[];
    };
    const { userId } = ctx.state.user;
    const result = await quoteService.updateQuote(Number(id), content, tagIds, newTagsName, userId);
    Response.success(ctx, result, '摘抄更新成功');
  }

  async exportCsv(ctx: Context) {
    const { tagIds } = ctx.query as Record<string, string>;
    const { userId } = ctx.state.user;

    let processedTagIds: string[] | null = null;
    if (tagIds !== undefined && tagIds !== null && tagIds !== '') {
      processedTagIds = String(tagIds)
        .split(',')
        .map((id) => id.trim())
        .filter((id) => id.length > 0);
    }

    const buffer = await quoteService.exportQuotes(processedTagIds, userId);
    const dateStr = new Date().toISOString().slice(0, 10);

    ctx.set(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    );
    ctx.set(
      'Content-Disposition',
      `attachment; filename="quotes_export_${dateStr}.xlsx"`,
    );
    ctx.body = Buffer.from(buffer);
  }

  async delete(ctx: Context) {
    const { id } = ctx.params as { id: string };
    const { userId } = ctx.state.user;
    await quoteService.deleteQuote(Number(id), userId);
    Response.success(ctx, null, '摘抄删除成功');
  }
}

const quoteController = new QuoteController();
export { quoteController, QuoteController };
