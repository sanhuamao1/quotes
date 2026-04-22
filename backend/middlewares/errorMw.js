const BusinessError = require("../utils/BusinessError");
const Response = require("../utils/Response");

const errorMw = async (ctx, next) => {
  try {
    await next();
  } catch (error) {
    console.error("❌ 全局错误:", error);
    if (error instanceof BusinessError) {
      Response.error(ctx, error.message, error.code, error.status);
    } else {
      Response.error(ctx, error.message || "服务器内部错误", -1, 500);
    }
  }
};

module.exports = errorMw;
