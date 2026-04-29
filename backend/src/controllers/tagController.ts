import { Context } from 'koa';
import { tagService } from '../services/tagService';
import { Response } from '../utils/Response';

class TagController {
  async list(ctx: Context) {
    const { userId } = ctx.state.user;
    const tags = await tagService.getTags(userId);
    Response.success(ctx, tags);
  }

  async delete(ctx: Context) {
    const { id } = ctx.params;
    const { userId } = ctx.state.user;
    await tagService.deleteTag(Number(id), userId);
    Response.success(ctx, null, '标签删除成功');
  }

  async rename(ctx: Context) {
    const { id, newName } = ctx.request.body as { id: number; newName: string };
    const { userId } = ctx.state.user;
    const result = await tagService.renameTag(id, newName, userId);
    Response.success(ctx, result, '标签重命名成功');
  }
}

const tagController = new TagController();
export { tagController, TagController };
