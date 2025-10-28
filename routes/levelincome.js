const express = require("express");
const levelincome = require("../controllers/levelincome");
const router = express.Router();

router.use("/joinedseries", levelincome.getSeries);
router.post("/joinedcontestbyseries", levelincome.getJoinedContestBySeries);
router.post("/getlevelincome", levelincome.getLevelIncome);
router.post("/joinedcontestearnings", levelincome.joinedContestEarnings);

module.exports = router;
