const express = require('express')
const {fixtures} = require('../controllers')

const router = express.Router()

router.get('/fixtures', fixtures.getFixtures)

router.post('/activatefixtures', fixtures.activateFixtures)

module.exports = router