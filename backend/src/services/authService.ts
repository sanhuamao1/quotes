import axios from 'axios';
import jwt, { type SignOptions } from 'jsonwebtoken';
import { config } from '../config';
import { userModel } from '../models/User';
import { logger } from '../utils/logger';
import { AppError } from '../utils/AppError';

class AuthService {
  async wechatLogin(code: string) {
    try {
      // Call WeChat jscode2session API
      const { data } = await axios.get('https://api.weixin.qq.com/sns/jscode2session', {
        params: {
          appid: config.wechat.appId,
          secret: config.wechat.appSecret,
          js_code: code,
          grant_type: 'authorization_code',
        },
      });

      console.log('WeChat API response:', data);

      if (data.errcode) {
        logger.error('微信登录失败', { errcode: data.errcode, errmsg: data.errmsg });
        throw AppError.internal('微信登录失败，请稍后重试');
      }

      // Find or create user
      let user = await userModel.findByOpenid(data.openid);
      if (!user) {
        const id = await userModel.createUser({ openid: data.openid });
        user = { id, openid: data.openid };
      }

      // Sign JWT
      const token = jwt.sign({ userId: user.id, openid: user.openid }, config.jwt.secret, {
        expiresIn: config.jwt.expiresIn as string | number,
      } as SignOptions);

      return {
        token,
        user: { id: user.id, openid: user.openid },
      };
    } catch (error) {
      if (error instanceof AppError) throw error;
      logger.error('微信登录异常', { error });
      throw AppError.internal('登录服务异常，请稍后重试');
    }
  }
}

const authService = new AuthService();
export { authService, AuthService };
