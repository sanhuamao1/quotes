const Router = require("@koa/router");
const controller = require("../controllers/quote");

const {
  validateBody,
  validateQuery,
  validateParams,
} = require("../middlewares/validate");
const {
  createSchema,
  updateSchema,
  querySchema,
} = require("../schemas/quote");

const router = new Router();

router.get("/quotes", validateParams(querySchema), controller.list);
router.post("/quotes", validateBody(createSchema), controller.create);
router.get("/quotes/:id", controller.show);
router.put("/quotes/:id", validateBody(updateSchema), controller.update);
router.delete("/quotes/:id", controller.delete);

module.exports = router;
