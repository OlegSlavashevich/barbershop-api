const Router = require("express");
const router = new Router();
const MasterController = require("../controllers/master.controller");

router.get("/master", MasterController.getAllMasters);
router.post("/master", MasterController.addNewMaster);
router.get("/master/receptions", MasterController.getNearestReceptions);

module.exports = router;
