const express = require("express");
const userteams = require("../controllers/userTeams");
const { update_team_rank } = require("../services/sportsData");
const router = express.Router();

router.post("/creatuserteam", userteams.creatUserTeam);
router.post("/getuserteam", userteams.getUserTeam);
router.post("/getuserteambyid", userteams.getUserTeambyId);
router.post("/switchteam", userteams.switch_team);
router.post("/getplayerstats", userteams.getPlayerStats);
router.post("/seriesplayerdetails", userteams.series_player_details);
router.post("/updaterank", update_team_rank);

module.exports = router;
