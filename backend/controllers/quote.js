const quoteService = require("../services/quote");
const Response = require("../utils/Response");

class QuoteController {
  async list(ctx) {
    const { page = 1, pageSize = 20, tagIds, keyword } = ctx.query;

    // 处理 tagIds 参数：逗号分隔的标签ID
    let processedTagIds = null;
    if (tagIds !== undefined && tagIds !== null && tagIds !== "") {
      if (typeof tagIds === "string") {
        processedTagIds = tagIds
          .split(",")
          .map((id) => id.trim())
          .filter((id) => id.length > 0);
      } else {
        processedTagIds = tagIds
          .toString()
          .split(",")
          .map((id) => id.trim())
          .filter((id) => id.length > 0);
      }
    }

    const result = await quoteService.getQuotes(
      parseInt(page),
      parseInt(pageSize),
      processedTagIds,
      keyword,
    );
    Response.success(ctx, result);
  }

  async create(ctx) {
    const { content, tags = [] } = ctx.request.body;
    const result = await quoteService.createQuote(content, tags);
    Response.success(ctx, result, "摘抄创建成功");
  }

  async update(ctx) {
    const { id } = ctx.params;
    const { content, tags = [] } = ctx.request.body;
    const result = await quoteService.updateQuote(id, content, tags);
    Response.success(ctx, result, "摘抄更新成功");
  }

  async delete(ctx) {
    const { id } = ctx.params;
    await quoteService.deleteQuote(id);
    Response.success(ctx, null, "摘抄删除成功");
  }

  async show(ctx) {
    const { id } = ctx.params;
    const quote = await quoteService.getQuoteById(id);
    Response.success(ctx, quote);
  }
}

module.exports = new QuoteController();
