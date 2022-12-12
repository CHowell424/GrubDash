const router = require("express").Router();
const controller = require("./orders.controller");
const methonNotAllowed = require("../errors/methodNotAllowed");

router.route("/:orderId").get(controller.read).delete(controller.delete).put(controller.update).all(methonNotAllowed);
router.route("/").get(controller.list).post(controller.create).all(methonNotAllowed);

module.exports = router;
//