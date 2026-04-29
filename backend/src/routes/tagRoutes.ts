import Router from '@koa/router';
import { tagController } from '../controllers/tagController';
import { tagSchema } from '../schemas/tagSchema';
import { validate } from '../middlewares/validation';
import { authMiddleware } from '../middlewares/authMiddleware';

const router = new Router();

router.get('/tags', authMiddleware, tagController.list);
router.put('/tags/rename', authMiddleware, validate(tagSchema.rename), tagController.rename);
router.delete('/tags/:id', authMiddleware, validate(tagSchema.deleteParam), tagController.delete);

export default router;
