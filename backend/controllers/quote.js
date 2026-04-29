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
        const { content, tagIds = [], newTagsName = [] } = ctx.request.body;
        const result = await quoteService.createQuote(
            content,
            tagIds,
            newTagsName,
        );
        Response.success(ctx, result, "摘抄创建成功");
    }

    async update(ctx) {
        const { id } = ctx.params;
        const { content, tagIds = [], newTagsName = [] } = ctx.request.body;
        const result = await quoteService.updateQuote(
            id,
            content,
            tagIds,
            newTagsName,
        );
        Response.success(ctx, result, "摘抄更新成功");
    }

    async exportCsv(ctx) {
        let processedTagIds = null;
        const { tagIds } = ctx.query;

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

        const csv = await quoteService.exportQuotes(processedTagIds);
        const dateStr = new Date().toISOString().slice(0, 10);

        ctx.set("Content-Type", "text/csv; charset=utf-8");
        ctx.set(
            "Content-Disposition",
            `attachment; filename="quotes_export_${dateStr}.csv"`,
        );
        ctx.body = csv;
    }

    async delete(ctx) {
        const { id } = ctx.params;
        await quoteService.deleteQuote(id);
        Response.success(ctx, null, "摘抄删除成功");
    }
}

module.exports = new QuoteController();
