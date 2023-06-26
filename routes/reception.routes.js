const Router = require("express");
const router = new Router();
const ReceptionController = require("../controllers/reception.controller");

router.get("/receptions", ReceptionController.getAllReceptions);
router.post("/receptions", ReceptionController.addNewReception);
router.get("/receptions/dates", ReceptionController.getDates);
router.get("/receptions/excludedTimes", ReceptionController.getBusyTimes);

module.exports = router;
