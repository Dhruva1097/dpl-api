const express = require("express");
const squads = require("../controllers/squads");

const router = express.Router();

router.post("/squadlist", squads.getSquads);

module.exports = router;
