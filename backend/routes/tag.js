const Router = require("@koa/router");
const tagController = require("../controllers/tag");

const router = new Router();

router.get("/tags", tagController.list);
router.get("/tags/:id/quotes", tagController.getQuotesByTag);
router.put("/tags/rename", tagController.rename);
router.get("/stats", tagController.getStats);

module.exports = router;
