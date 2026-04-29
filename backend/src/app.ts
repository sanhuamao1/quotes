import Koa from 'koa';
import bodyParser from 'koa-bodyparser';
import { errorHandler, loggerMiddleware, corsMiddleware } from './middlewares';
import apiRouter from './routes';

const app = new Koa();

// Global middlewares (order matters)
app.use(errorHandler);
app.use(loggerMiddleware);
app.use(corsMiddleware);
app.use(bodyParser());

// Routes
app.use(apiRouter.routes());
app.use(apiRouter.allowedMethods());

export default app;
