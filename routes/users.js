const express = require("express");
const notification = require("../controllers/notification");
const users = require("../controllers/users");
const router = express.Router();

router.get("/withdraw-cash", users.withdraw_cash);
router.get("/transation-history-new", users.user_transactions);
router.get("/MLMWallet", users.mlm_wallet);
router.get("/profile", users.user_profile);
router.post("/edit-user-team-name", users.update_team_name);
router.put("/update_personal_details", users.update_user_profile);
router.post("/updateUserImage", users.upload_image);
router.post("/verify-pan-detail", users.verify_pan);
router.post("/verify-bank-detail", users.verify_bank);
router.get("/getrefferalcode", users.getReferralCode);
router.get("/withdraw-detail", users.withdraw_details);
router.get("/referrals", users.referrals);
router.post("/player_details", users.player_details);
router.post("/team-profile-comparision", users.user_team_comparison);
router.get("/notify", notification.notify);

module.exports = router;
