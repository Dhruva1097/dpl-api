const express = require('express')
const {paymentgateway} = require('../controllers')
const router = express.Router()
const multer = require("multer");
const upload = multer({ storage: multer.memoryStorage() });

router.post('/newpayment', paymentgateway.newPayment)
router.post('/checkpaymentstatus', paymentgateway.checkPaymentStatus)
router.post('/withdrawrequest', paymentgateway.withdrawRequest)
router.post('/paymentstatus', upload.any() ,paymentgateway.payMentStatus)

module.exports = router