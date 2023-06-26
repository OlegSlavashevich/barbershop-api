const Router = require("express");
const router = new Router();
const ServiceController = require("../controllers/service.controller");

router.get("/service", ServiceController.getAllServices);
router.post("/service", ServiceController.addNewService);

module.exports = router;
