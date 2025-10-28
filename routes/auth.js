const express = require('express');
const auth = require('../controllers/auth');
const { update_team_points, getzquadSportsData, getLiveScore } = require('../services/sportsData');

const router = express.Router();

/**
 * @swagger
 * /signup:
 *   post:
 *     summary: Sign up a new user
 *     description: Creates a new user in the system.
 *     parameters:
 *       - name: user_name
 *         in: body
 *         required: true
 *         description: The user's name.
 *         schema:
 *           type: string
 *       - name: mobile_number
 *         in: body
 *         required: true
 *         description: The user's mobile number.
 *         schema:
 *           type: string
 *       - name: invite_code
 *         in: body
 *         required: true
 *         description: The invite code for registration.
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: User created successfully.
 *       400:
 *         description: Bad request.
 */
router.post('/signup', auth.signup);

/**
 * @swagger
 * /signin:
 *   post:
 *     summary: Sign in an existing user
 *     description: Authenticates a user and returns an OTP.
 *     parameters:
 *       - name: mobile_number
 *         in: body
 *         required: true
 *         description: The user's mobile number.
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: User signed in successfully.
 *       400:
 *         description: Bad request.
 */
router.post('/signin', auth.signin);

/**
 * @swagger
 * /verify-otp:
 *   post:
 *     summary: Verify OTP for user authentication
 *     description: Validates the OTP sent to the user.
 *     parameters:
 *       - name: user_otp
 *         in: body
 *         required: true
 *         description: The OTP sent to the user.
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: OTP verified successfully.
 *       400:
 *         description: Invalid OTP.
 */
router.post('/verify-otp', auth.verifyOtp);

/**
 * @swagger
 * /resend-otp:
 *   post:
 *     summary: Resend OTP to the user
 *     description: Sends a new OTP to the user's mobile number.
 *     parameters:
 *       - name: mobile_number
 *         in: body
 *         required: true
 *         description: The user's mobile number.
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: OTP resent successfully.
 *       400:
 *         description: Bad request.
 */
router.post('/resend-otp', auth.resend_otp);

/**
 * @swagger
 * /logout:
 *   get:
 *     summary: Log out the user
 *     description: Logs the user out of the system.
 *     responses:
 *       200:
 *         description: User logged out successfully.
 */
router.get('/logout', auth.logout);

/**
 * @swagger
 * /check:
 *   get:
 *     summary: Check or update team points
 *     description: Retrieves or updates the team points.
 *     responses:
 *       200:
 *         description: Team points checked/updated successfully.
 */
router.get('/check', update_team_points);

module.exports = router;
