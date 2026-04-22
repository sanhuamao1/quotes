const Koa = require("koa");
const Router = require("@koa/router");
const quoteRoute = require("./routes/quote");
const tagRoute = require("./routes/tag");
const errorMw = require("./middlewares/errorMw");
const corsMw = require("./middlewares/crosMw");

const initDatabase = require("./db/init");
initDatabase();

require("dotenv").config();

const app = new Koa();

// 全局错误处理中间件
app.use(errorMw);
app.use(corsMw);

// 中间件：处理 JSON 请求体
app.use(async (ctx, next) => {
  if (ctx.method === "POST" || ctx.method === "PUT") {
    ctx.request.body = await new Promise((resolve) => {
      let data = "";
      ctx.req.on("data", (chunk) => {
        data += chunk;
      });
      ctx.req.on("end", () => {
        resolve(data ? JSON.parse(data) : {});
      });
    });
  }
  await next();
});

// 创建主路由，添加 /api 前缀
const apiRouter = new Router({ prefix: "/api" });

// 健康检查接口
apiRouter.get("/health", (ctx) => {
  ctx.body = {
    status: "ok",
    timestamp: new Date().toISOString(),
    service: "logpro-backend",
    version: "1.0.0",
  };
});

// 注册子路由
apiRouter.use(quoteRoute.routes(), quoteRoute.allowedMethods());
apiRouter.use(tagRoute.routes(), tagRoute.allowedMethods());

// 使用主路由
app.use(apiRouter.routes());

// 启动服务器
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

module.exports = app;
