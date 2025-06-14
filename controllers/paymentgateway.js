const jwt = require('jsonwebtoken')
const crypto = require('crypto')
const sha256 = require('sha256')
const axios = require('axios');
const { Users, Transactions, Withdraw_Request, Setting, sequelize, Payment_Response } = require('../models')
require('dotenv').config()
const { base64decode } = require('nodejs-base64');
const BASE_URL = "https://infinityshopy.in/wp-json";

const newPayment = async (req, res) => {
    try {
        const { price } = await req.body
        console.log('Request body price:', price);
        const token = await req.headers.authorization.split(" ")[1]
        const { mobile_number } = jwt.verify(token, process.env.NODE_SECRET_KEY)
        const { id } = await Users.findOne({ where: { 'mobile_number': mobile_number }, raw: true })
        console.log('User ID:', id);
        const merchantTransactionId = id + 'DPL' + Date.now();
        const merchantId = process.env.MERCHANT_ID
        const merchantUserId = 'MUID' + id
        const amount = price / 1.3;
        const data = {
            merchantUserId: merchantUserId,
            merchantId: merchantId,
            merchantTransactionId: merchantTransactionId,
            amount: amount,
            redirectUrl: "https://start25pro.com/cmspages/phonepe-success",
            redirectMode: 'POST',
            paymentInstrument: {
                type: 'PAY_PAGE'
            }
        }
        console.log('Payload data object:', data);

        const prod_URL = `${BASE_URL}/phonepe/v1/pay`

        const options = {
            method: 'POST',
            url: prod_URL,
            headers: {
                accept: 'application/json',
                'Content-Type': 'application/json',
                'X-CALLBACK-URL': 'https://dpl11.fantasycricketdevelopment.com/payment/paymentstatus'
            },
            data: {
                price: amount
            }
        }
        console.log('Axios request options:', options);
        await axios.request(options).then(async response => {
            const current_time = Date.now()
            await Transactions.create({
                user_id: id,
                trans_type_id: 16,
                txn_date: current_time,
                txn_amount: amount,
                txn_id: response.data.tnxid,
                status: 0
            })
            console.log(merchantTransactionId)
            res.status(200).json({
                status: true,
                message: "Payment Initiated",
                data: { txnId: merchantTransactionId, url: response.data.data.instrumentResponse.redirectInfo.url }
            })
        }).catch((error) => {
            console.log('Error in payment initiation:', error.message);
            res.status(200).json({ status: true, message: 'Payment Initiation Failed', data: error })
        })
    } catch (error) {
        console.log('Error in newPayment function:', error.message);
        res.status(404).json({ status: false, message: error.message })
    }
}

const payMentStatus = async (req, res) => {
    try {
        console.log('Request body:', req.body);
        const { order_id, status, total_amount } = await req.body;
        const totalAmount = parseFloat(total_amount);
        if (isNaN(totalAmount)) {
            throw new Error("Invalid total_amount value");
        }
        const orderID = String(order_id);
        const transaction_msg = "Transaction Successful";
        const transactions = await Transactions.findOne({ where: { "txn_id": orderID }, raw: true })
        const current_time = Date.now()
        if (status == "processing") {
            await Transactions.update({ trans_type_id: 17, status: 1, pay_api_response: transaction_msg }, { where: { "txn_id": orderID } })
            if (!transactions?.status) {
                await Users.update({ cash_balance: sequelize.literal(`cash_balance + ${totalAmount}`) }, { where: { id: transactions.user_id } })
            }
        } else {
            if (transactions) {
                await Transactions.update({ trans_type_id: 11, status: 1, pay_api_response: transaction_msg }, { where: { "txn_id": orderID } })
            } else {
                await Transactions.create({
                    user_id: transactions.user_id,
                    trans_type_id: 1,
                    txn_date: current_time,
                    txn_amount: totalAmount,
                    txn_id: orderID,
                    pay_api_response: transaction_msg,
                    status: 0
                })
            }
        }
        return res.status(200).send({ success: true, message: `Deposited ${totalAmount} in your wallet` });
    }
    catch (error) {
        console.log(error.message)
        res.status(400).json({ data: "error" })
    }
}

const checkPaymentStatus = async (req, res) => {
    try {

        const merchantTransactionId = await req.body['txnId']
        console.log(req.body);
        return res.status(200).send({ success: true, message: `Transaction Initiated` });
        const options = {
            method: 'GET',
            url: `${BASE_URL}/custom-api/v1/order/${merchantTransactionId}`,
            headers: {
                accept: 'application/json',
                'Content-Type': 'application/json',
            }
        }

        await axios.request(options).then(async (response) => {
            console.log('Response from payment status check:', response.data);
            const { status, id, total } = await response.data
            // const transactions = await Transactions.findOne({ where: { "txn_id": id }, raw: true })
            if (status == "processing") {
                return res.status(200).send({ success: true, message: `${total} credited` });
            } else {
                return res.status(400).send({ success: false, message: "error" });
            }
        }).catch((error) => {
            console.log('Response from payment status check:', response.data);
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
        const token = req.headers.authorization?.split(" ")[1];
        const { mobile_number } = jwt.verify(token, process.env.NODE_SECRET_KEY);

        const users = await Users.findOne({ where: { mobile_number }, raw: true });
        const { type, winning_amount, cash_back, level_income } = req.body;
        const { min_withdraw_amount, max_withdraw_amount } = await Setting.findOne({ raw: true });

        console.log('Withdraw Request:', req.body);

        const withdrawMapping = {
            CASH_BACK: { amount: cash_back, userField: 'level_income' },
            LEVEL_INCOME: { amount: level_income, userField: 'cashback' },
            WINNING_AMOUNT: { amount: winning_amount, userField: 'winning_amount' },
        };

        const { amount: userWithdraw, userField } = withdrawMapping[type] || {};
        const withdraw_amount = users?.[userField];

        if (!userWithdraw || !withdraw_amount) {
            return res.status(200).json({ status: true, message: 'Invalid request', data: {} });
        }

        if (userWithdraw >= min_withdraw_amount && userWithdraw <= max_withdraw_amount && withdraw_amount >= userWithdraw) {
            const current_time = Date.now();
            const tx_id = `W${current_time}`;

            await Users.update(
                { [userField]: withdraw_amount - userWithdraw },
                { where: { id: users.id } }
            );

            await Withdraw_Request.create({
                user_id: users.id,
                amount: 0,
                refund_amount: userWithdraw,
                request_status: 0,
                type,
                tx_id,
            });

            await Transactions.create({
                user_id: users.id,
                trans_type_id: 9,
                tx_id,
                txn_date: current_time,
                txn_amount: userWithdraw,
                status: 0,
            });

            return res.status(200).json({ status: true, message: 'Requested Successfully', data: {} });
        } else {
            return res.status(200).json({ status: true, message: 'Request Failed! Insufficient Amount', data: {} });
        }
    } catch (error) {
        console.error(error.message);
        res.status(404).json({ status: false, message: error.message });
    }
};


module.exports = {
    newPayment,
    checkPaymentStatus,
    withdrawRequest,
    payMentStatus
}