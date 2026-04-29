import Router from '@koa/router';
import { authController } from '../controllers/authController';
import { authSchema } from '../schemas/authSchema';
import { validate } from '../middlewares/validation';

const router = new Router();

router.post('/auth/wechat-login', validate(authSchema.login), authController.wechatLogin);

export default router;
