
const express = require('express')
const {banners} = require('../controllers')
const router = express.Router()

router.get('/banner-list', banners.fetch_banner)

module.exports = router