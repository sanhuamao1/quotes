const corsMw = async (ctx, next) => {
  ctx.set("Access-Control-Allow-Origin", "*");
  ctx.set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  ctx.set("Access-Control-Allow-Headers", "Content-Type, Authorization");
  if (ctx.method === "OPTIONS") {
    ctx.status = 204;
    return;
  }
  await next();
};
module.exports = corsMw;
