import { Context } from 'koa';
import { authService } from '../services/authService';
import { Response } from '../utils/Response';

class AuthController {
  async wechatLogin(ctx: Context) {
    const { code } = ctx.request.body as { code: string };
    const result = await authService.wechatLogin(code);
    Response.success(ctx, result, '登录成功');
  }
}

const authController = new AuthController();
export { authController, AuthController };
