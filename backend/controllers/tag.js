const tagService = require("../services/tag");
const Response = require("../utils/Response");

exports.list = async (ctx) => {
    const tags = await tagService.getTags();
    Response.success(ctx, tags);
};
exports.delete = async (ctx) => {
    const { id } = ctx.params;
    await tagService.deleteTag(id);
    Response.success(ctx, null, "标签删除成功");
};
exports.rename = async (ctx) => {
    const { id, newName } = ctx.request.body;
    const result = await tagService.renameTag(id, newName);
    Response.success(ctx, result, "标签重命名成功");
};
