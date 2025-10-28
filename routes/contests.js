const express = require("express");
const contests = require("../controllers/contests");
const router = express.Router();
const verifyJwt = require("../middleware/auth");

router.post("/contest_list", contests.contest);
router.post("/all_contest", contests.Total_contest);
router.post("/join-contest-wallet-amount", contests.verify_wallet_amount);
router.post("/joinContest", contests.join_contest);
router.post("/joined-contest-list", contests.joined_contest);
router.post("/joined-contest-details", contests.joined_contest_details);
router.post("/joined-contest-detail", contests.joined_contest_detail);
router.get("/joined-contest-matches", contests.Joined_contest_match);
router.get("/my-matches", contests.my_matches);
router.get("/get-filter-type", contests.contest_filter);
router.post("/level_income_details", contests.level_income_details);
router.post("/leader_board", contests.leader_board);
router.post("/user_cash_back", contests.user_cash_back);

module.exports = router;
