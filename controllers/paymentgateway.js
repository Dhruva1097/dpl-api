const jwt = require('jsonwebtoken')
const crypto = require('crypto')
const sha256 = require('sha256')
const axios = require('axios');
const { Users, Transactions, Withdraw_Request, Setting, sequelize, Payment_Response } = require('../models')
require('dotenv').config()
const { base64decode } = require('nodejs-base64');

const newPayment = async (req, res) => {
    try {
        const { price } = await req.body
        const token = await req.headers.authorization.split(" ")[1]
        const { mobile_number } = jwt.verify(token, process.env.NODE_SECRET_KEY)
        const { id } = await Users.findOne({ where: { 'mobile_number': mobile_number }, raw: true })

        const merchantTransactionId = 'DPL' + Date.now();
        const merchantId = process.env.MERCHANT_ID
        const merchantUserId = 'MUID' + id
        const amount = price
        const data = {
            merchantUserId: merchantUserId,
            merchantId: merchantId,
            merchantTransactionId: merchantTransactionId,
            amount: amount * 100,
            redirectUrl: "https://dpl11.com/cmspages/phonepe-success",
            callbackUrl: "https://dpl11.fantasycricketdevelopment.com/payment/paymentstatus",
            redirectMode: 'POST',
            paymentInstrument: {
                type: 'PAY_PAGE'
            }
        }

        const payload = Buffer.from(JSON.stringify(data), 'utf-8')
        const payloadMain = payload.toString('base64')
        const saltIndex = 1
        const string = payloadMain + '/pg/v1/pay' + process.env.SALT_KEY
        const sha_256 = sha256(string)
        const checksum = sha_256 + '###' + saltIndex
        const prod_URL = "https://api.phonepe.com/apis/hermes/pg/v1/pay"

        const options = {
            method: 'POST',
            url: prod_URL,
            headers: {
                accept: 'application/json',
                'Content-Type': 'application/json',
                'X-VERIFY': checksum,
                'X-CALLBACK-URL':'https://dpl11.fantasycricketdevelopment.com/payment/paymentstatus'
            },
            data: {
                request: payloadMain
            }
        }

        await axios.request(options).then(async response => {
            const current_time = Date.now()
            await Transactions.create({
                user_id: id,
                trans_type_id: 16,
                txn_date: current_time,
                txn_amount: amount,
                txn_id: merchantTransactionId,
                status: 0
            })
            console.log(merchantTransactionId)
            res.status(200).json({ status: true, message: "Payment Initiated", data: { txnId: merchantTransactionId, url: response.data.data.instrumentResponse.redirectInfo.url } })
        }).catch((error) => {
            res.status(200).json({ status: true, message: 'Payment Initiation Failed', data: error })
        })
    }
    catch (error) {
        res.status(404).json({ status: false, message: error.message })
    }
}

const payMentStatus = async (req, res) => {
    try {
        const b64string = base64decode(req.body.response)
        const merchantTransactionId = await JSON.parse(b64string).data.merchantTransactionId
        const merchantId = process.env.MERCHANT_ID
        const keyIndex = 1
        const string = `/pg/v1/status/${merchantId}/${merchantTransactionId}` + process.env.SALT_KEY
        const sha_256 = sha256(string)
        const checksum = sha_256 + "###" + keyIndex

        const options = {
            method: 'GET',
            url: `https://api.phonepe.com/apis/hermes/pg/v1/status/${merchantId}/${merchantTransactionId}`,
            headers: {
                accept: 'application/json',
                'Content-Type': 'application/json',
                'X-VERIFY': checksum,
                'X-MERCHANT-ID': `${merchantId}`
            }
        }

        await axios.request(options).then(async (response) => {
            const transaction_msg = await response.data.message
            const { merchantTransactionId, amount } = await response.data.data
            const transactions = await Transactions.findOne({ where: { "txn_id": merchantTransactionId }, raw: true })
            if (response.data.success === true) {
                const current_time = Date.now()
                if (response.data.code == "PAYMENT_SUCCESS") {
                    await Transactions.update({ trans_type_id: 17, status: 1, pay_api_response: transaction_msg }, { where: { "txn_id": merchantTransactionId } })
                    if (!transactions?.status) {
                        await Users.update({ cash_balance: sequelize.literal(`cash_balance + ${((amount / 130) * 100) / 100}`) }, { where: { id: transactions.user_id } })
                    }
                } else if (response.data.code == "PAYMENT_PENDING") {
                    if (transactions) {
                        await Transactions.update({ trans_type_id: 11, status: 1, pay_api_response: transaction_msg }, { where: { "txn_id": merchantTransactionId } })
                    } else {
                        await Transactions.create({
                            user_id: transactions.user_id,
                            trans_type_id: 1,
                            txn_date: current_time,
                            txn_amount: (((amount / 130) * 100) / 100),
                            txn_id: merchantTransactionId,
                            pay_api_response: transaction_msg,
                            status: 0
                        })
                    }
                }
                return res.status(200).send({ success: true, message: response.data.code });
            } else {
                await Transactions.update({ trans_type_id: 12, status: 1, pay_api_response: transaction_msg }, { where: { "txn_id": merchantTransactionId } })
                return res.status(400).send({ success: false, message: response.data.code });
            }
        }).catch((error) => {
            res.status(200).json({ status: 200, message: 'Transaction Message', data: error })
        })
    }
    catch (error) {
        console.log(error.message)
        res.status(400).json({ data: "error" })
    }
}

const checkPaymentStatus = async (req, res) => {
    try {
        
        const merchantTransactionId = await req.body['txnId']
        const merchantId = process.env.MERCHANT_ID
        const keyIndex = 1
        const string = `/pg/v1/status/${merchantId}/${merchantTransactionId}` + process.env.SALT_KEY
        const sha_256 = sha256(string)
        const checksum = sha_256 + "###" + keyIndex

        const options = {
            method: 'GET',
            url: `https://api.phonepe.com/apis/hermes/pg/v1/status/${merchantId}/${merchantTransactionId}`,
            headers: {
                accept: 'application/json',
                'Content-Type': 'application/json',
                'X-VERIFY': checksum,
                'X-MERCHANT-ID': `${merchantId}`
            }
        }

        await axios.request(options).then(async (response) => {
            const transaction_msg = await response.data.message
            const { merchantTransactionId, amount } = await response.data.data
            const transactions = await Transactions.findOne({ where: { "txn_id": merchantTransactionId }, raw: true })
            if (response.data.success === true) {
                const current_time = Date.now()
                if (response.data.code == "PAYMENT_SUCCESS") {
                    await Transactions.update({ trans_type_id: 17, status: 1, pay_api_response: transaction_msg }, { where: { "txn_id": merchantTransactionId } })
                    if (!transactions?.status) {
                        await Users.update({ cash_balance: sequelize.literal(`cash_balance + ${((amount / 130) * 100) / 100}`) }, { where: { id: transactions.user_id } })
                    }
                } else if (response.data.code == "PAYMENT_PENDING") {
                    if (transactions) {
                        await Transactions.update({ trans_type_id: 11, status: 1, pay_api_response: transaction_msg }, { where: { "txn_id": merchantTransactionId } })
                    } else {
                        await Transactions.create({
                            user_id: transactions.user_id,
                            trans_type_id: 1,
                            txn_date: current_time,
                            txn_amount: (((amount / 130) * 100) / 100),
                            txn_id: merchantTransactionId,
                            pay_api_response: transaction_msg,
                            status: 0
                        })
                    }
                }
                return res.status(200).send({ success: true, message: response.data.code });
            } else {
                await Transactions.update({ trans_type_id: 12, status: 1, pay_api_response: transaction_msg }, { where: { "txn_id": merchantTransactionId } })
                return res.status(400).send({ success: false, message: response.data.code });
            }
        }).catch((error) => {
            res.status(200).json({ status: 200, message: 'Transaction Message', data: error })
        })
    }
    catch (error) {
        res.status(404).json({ status: false, message: error.message, data: "" })
    }
}

const checkPaymentStatusCron = async () => {
    try {
        const pendding_transaction = await Tansaction
        const merchantTransactionId = await req.body['txnId']
        const merchantId = process.env.MERCHANT_ID
        const keyIndex = 1
        const string = `/pg/v1/status/${merchantId}/${merchantTransactionId}` + process.env.SALT_KEY
        const sha_256 = sha256(string)
        const checksum = sha_256 + "###" + keyIndex

        const options = {
            method: 'GET',
            url: `https://api.phonepe.com/apis/hermes/pg/v1/status/${merchantId}/${merchantTransactionId}`,
            headers: {
                accept: 'application/json',
                'Content-Type': 'application/json',
                'X-VERIFY': checksum,
                'X-MERCHANT-ID': `${merchantId}`
            }
        }

        await axios.request(options).then(async (response) => {
            const transaction_msg = await response.data.message
            const { merchantTransactionId, amount } = await response.data.data
            const transactions = await Transactions.findOne({ where: { "txn_id": merchantTransactionId }, raw: true })
            if (response.data.success === true) {
                const current_time = Date.now()
                if (response.data.code == "PAYMENT_SUCCESS") {
                    await Transactions.update({ status: 1, pay_api_response: transaction_msg }, { where: { "txn_id": merchantTransactionId } })
                    if (!transactions?.status) {
                        await Users.update({ cash_balance: sequelize.literal(`cash_balance + ${((amount / 130) * 100) / 100}`) }, { where: { id: transactions.user_id } })
                    }
                } else if (response.data.code == "PAYMENT_PENDING") {
                    // const transacation_data = await Transactions.findOne({ where: { "txn_id": merchantTransactionId } })
                    if (transactions) {
                        await Transactions.update({ status: 1, pay_api_response: transaction_msg }, { where: { "txn_id": merchantTransactionId } })
                    } else {
                        await Transactions.create({
                            user_id: transactions.user_id,
                            trans_type_id: 1,
                            txn_date: current_time,
                            txn_amount: (((amount / 130) * 100) / 100),
                            txn_id: merchantTransactionId,
                            pay_api_response: transaction_msg,
                            status: 0
                        })
                    }
                }
                return res.status(200).send({ success: true, message: response.data.code });
            } else {
                await Transactions.update({ status: 1, pay_api_response: transaction_msg }, { where: { "txn_id": merchantTransactionId } })
                return res.status(400).send({ success: false, message: response.data.code });
            }
        }).catch((error) => {
            res.status(200).json({ status: 200, message: 'Transaction Message', data: error })
        })
    }
    catch (error) {
        res.status(404).json({ status: false, message: error.message, data: "" })
    }
}

const withdrawRequest = async (req, res) => {
    try {
        const token = await req.headers.authorization.split(" ")[1]
        const { mobile_number } = jwt.verify(token, process.env.NODE_SECRET_KEY)
        const users = await Users.findOne({ where: { 'mobile_number': mobile_number }, raw: true })
        const { type, winning_amount, cash_back, level_income } = await req.body
        const settings = await Setting.findOne({ raw: true })
        const { min_withdraw_amount, max_withdraw_amount } = await settings

        const withdraw_amount = await winning_amount ? winning_amount : cash_back ? cash_back : level_income ? level_income : 0
        const user_amount = await winning_amount ? users.winning_amount : cash_back ? users.cashback : level_income ? users.level_income : 0
        // console.log(user_amount)
        // console.log(withdraw_amount)

        if (withdraw_amount >= min_withdraw_amount && withdraw_amount <= max_withdraw_amount && user_amount >= withdraw_amount) {
            const current_time = Date.now()
            await Withdraw_Request.create({
                user_id: users.id,
                amount: 0,
                refund_amount: withdraw_amount,
                request_status: 0,
                type: type,
                tx_id: `DPL${Date.now()}`
            })
            await Transactions.create({
                user_id: users.id,
                trans_type_id: 9,
                tx_id: `DPL${Date.now()}`,
                txn_date: current_time,
                txn_amount: withdraw_amount,
                status: 0
            })
            await Users.update({
                winning_amount: (users.winning_amount - withdraw_amount)
            }, { where: { id: users.id } })
            return res.status(200).json({ status: true, message: 'Requested Successfully', data: {} })
        }
        else {
            return res.status(200).json({ status: true, message: 'Request Failed! Insufficient Amount', data: {} })
        }

    }
    catch (error) {
        console.log(error.message)
        res.status(404).json({ status: false, message: error.message })
    }
}

module.exports = {
    newPayment,
    checkPaymentStatus,
    withdrawRequest,
    payMentStatus
}