const tagService = require("../services/tag");
const Response = require("../utils/Response");

exports.list = async (ctx) => {
  const tags = await tagService.getTags();
  Response.success(ctx, tags);
};

exports.getQuotesByTag = async (ctx) => {
  const { id } = ctx.params;
  const { page = 1, pageSize = 20 } = ctx.query;
  const result = await tagService.getQuotesByTag(id, parseInt(page), parseInt(pageSize));
  Response.success(ctx, result);
};

exports.rename = async (ctx) => {
  const { oldName, newName } = ctx.request.body;
  await tagService.renameTag(oldName, newName);
  Response.success(ctx, null, "标签重命名成功");
};

exports.getStats = async (ctx) => {
  const stats = await tagService.getStats();
  Response.success(ctx, stats);
};