
const express = require('express');
const { contests } = require('../controllers');
const router = express.Router();
const verifyJwt = require('../middleware/auth');

/**
 * @swagger
 * /contest_list:
 *   post:
 *     summary: Get a list of contests
 *     description: Retrieves a list of contests available.
 *     responses:
 *       200:
 *         description: List of contests retrieved successfully.
 *       400:
 *         description: Bad request.
 */
router.post('/contest_list', contests.contest);

/**
 * @swagger
 * /all_contest:
 *   post:
 *     summary: Get all contests
 *     description: Retrieves all contests in the system.
 *     responses:
 *       200:
 *         description: All contests retrieved successfully.
 *       400:
 *         description: Bad request.
 */
router.post('/all_contest', contests.Total_contest);

/**
 * @swagger
 * /join-contest-wallet-amount:
 *   post:
 *     summary: Verify wallet amount for joining a contest
 *     description: Checks if the user has enough wallet balance to join a contest.
 *     responses:
 *       200:
 *         description: Wallet amount verified successfully.
 *       400:
 *         description: Bad request.
 */
router.post('/join-contest-wallet-amount', contests.verify_wallet_amount);

/**
 * @swagger
 * /joinContest:
 *   post:
 *     summary: Join a contest
 *     description: Allows a user to join a specific contest.
 *     responses:
 *       200:
 *         description: User joined the contest successfully.
 *       400:
 *         description: Bad request.
 */
router.post('/joinContest', contests.join_contest);

/**
 * @swagger
 * /joined-contest-list:
 *   post:
 *     summary: Get a list of joined contests
 *     description: Retrieves a list of contests that the user has joined.
 *     responses:
 *       200:
 *         description: List of joined contests retrieved successfully.
 *       400:
 *         description: Bad request.
 */
router.post('/joined-contest-list', contests.joined_contest);

/**
 * @swagger
 * /joined-contest-details:
 *   post:
 *     summary: Get details of a joined contest
 *     description: Retrieves details of a specific contest that the user has joined.
 *     responses:
 *       200:
 *         description: Contest details retrieved successfully.
 *       400:
 *         description: Bad request.
 */
router.post('/joined-contest-details', contests.joined_contest_details);

/**
 * @swagger
 * /joined-contest-detail:
 *   post:
 *     summary: Get detailed information about a joined contest
 *     description: Retrieves detailed information about a specific joined contest.
 *     responses:
 *       200:
 *         description: Detailed information retrieved successfully.
 *       400:
 *         description: Bad request.
 */
router.post('/joined-contest-detail', contests.joined_contest_detail);

/**
 * @swagger
 * /joined-contest-matches:
 *   get:
 *     summary: Get matches for joined contests
 *     description: Retrieves matches related to contests that the user has joined.
 *     responses:
 *       200:
 *         description: Matches retrieved successfully.
 *       400:
 *         description: Bad request.
 */
router.get('/joined-contest-matches', contests.Joined_contest_match);

/**
 * @swagger
 * /my-matches:
 *   get:
 *     summary: Get user's matches
 *     description: Retrieves matches associated with the user.
 *     responses:
 *       200:
 *         description: User's matches retrieved successfully.
 *       400:
 *         description: Bad request.
 */
router.get('/my-matches', contests.my_matches);

/**
 * @swagger
 * /get-filter-type:
 *   get:
 *     summary: Get filter types for contests
 *     description: Retrieves available filter types for contests.
 *     responses:
 *       200:
 *         description: Filter types retrieved successfully.
 *       400:
 *         description: Bad request.
 */
router.get('/get-filter-type', contests.contest_filter);

/**
 * @swagger
 * /level_income_details:
 *   post:
 *     summary: Get level income details
 *     description: Retrieves income details based on levels.
 *     responses:
 *       200:
 *         description: Level income details retrieved successfully.
 *       400:
 *         description: Bad request.
 */
router.post('/level_income_details', contests.level_income_details);

/**
 * @swagger
 * /leader_board:
 *   post:
 *     summary: Get leaderboard
 *     description: Retrieves the leaderboard for contests.
 *     responses:
 *       200:
 *         description: Leaderboard retrieved successfully.
 *       400:
 *         description: Bad request.
 */
router.post('/leader_board', contests.leader_board);

/**
 * @swagger
 * /user_cash_back:
 *   post:
 *     summary: Get user cashback information
 *     description: Retrieves cashback information for the user.
 *     responses:
 *       200:
 *         description: Cashback information retrieved successfully.
 *       400:
 *         description: Bad request.
 */
router.post('/user_cash_back', contests.user_cash_back);

module.exports = router;
