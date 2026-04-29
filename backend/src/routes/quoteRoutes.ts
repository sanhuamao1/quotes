import Router from '@koa/router';
import { quoteController } from '../controllers/quoteController';
import { quoteSchema } from '../schemas/quoteSchema';
import { validate } from '../middlewares/validation';
import { authMiddleware } from '../middlewares/authMiddleware';

const router = new Router();

router.get('/quotes', authMiddleware, validate(quoteSchema.query), quoteController.list);
router.get('/quotes/export', authMiddleware, quoteController.exportCsv);
router.post('/quotes', authMiddleware, validate(quoteSchema.create), quoteController.create);
router.put('/quotes/:id', authMiddleware, validate(quoteSchema.update), quoteController.update);
router.delete('/quotes/:id', authMiddleware, validate(quoteSchema.deleteParam), quoteController.delete);

export default router;
