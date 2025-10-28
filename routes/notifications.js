const express = require("express");
const notification = require("../controllers/notification");
const router = express.Router();

router.get("/notification-list", notification.notification_list);
router.post("/clear-notification", notification.notification_delete);

module.exports = router;
