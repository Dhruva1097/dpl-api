const express = require('express')
const {scorecard} = require('../controllers')

const router = express.Router()

router.post('/getscorecard', scorecard.getScoreCard)
router.post('/getfullscoredata', scorecard.getFullScoreData)

module.exports = router