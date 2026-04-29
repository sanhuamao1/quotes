import Router from '@koa/router';
import quoteRoutes from './quoteRoutes';
import tagRoutes from './tagRoutes';
import authRoutes from './authRoutes';

const apiRouter = new Router({ prefix: '/api' });

// Health check
apiRouter.get('/health', (ctx) => {
  ctx.body = {
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'logpro-backend',
    version: '1.0.0',
  };
});

// Mount auth routes (no auth middleware — these are public)
apiRouter.use(authRoutes.routes(), authRoutes.allowedMethods());

// Mount protected routes
apiRouter.use(quoteRoutes.routes(), quoteRoutes.allowedMethods());
apiRouter.use(tagRoutes.routes(), tagRoutes.allowedMethods());

export default apiRouter;
