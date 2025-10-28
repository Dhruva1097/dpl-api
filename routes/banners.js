const express = require("express");
const banners = require("../controllers/banners");
const router = express.Router();

router.get("/banner-list", banners.fetch_banner);

module.exports = router;
