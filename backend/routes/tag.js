const Router = require("@koa/router");
const tagController = require("../controllers/tag");

const router = new Router();

router.get("/tags", tagController.list);
router.put("/tags/rename", tagController.rename);
router.delete("/tags/:id", tagController.delete);

module.exports = router;
