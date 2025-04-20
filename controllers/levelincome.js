const jwt = require('jsonwebtoken')
const { Users, Join_contest, Series, Contests, Contest_category, Wallet_transaction, Referral, sequelize } = require('../models')
const { Op } = require('sequelize')

const getSeries = async (req, res) => {
    try {
        const token = await req.headers.authorization.split(" ")[1]
        const { mobile_number } = jwt.verify(token, process.env.NODE_SECRET_KEY)
        const users = await Users.findAll({
            include: [{
                model: Join_contest,
                include: [{
                    model: Series,
                    attributes: { exclude: ['match_type', 'status', 'start_date', 'end_date', 'active', 'createdAt', 'updatedAt'] }
                }]
            }],
            where: { 'mobile_number': mobile_number }
        })

        const contests = await users.map(e => e.join_contests.map(contest => contest.series))
        let key = 'id'
        const series = [...new Map(contests[0].map(e => [e[key], e])).values()]

        // console.log(contests)

        res.status(200).json({ status: true, message: 'Data Found', data: series })
    }
    catch (error) {
        console.log(error.message)
        res.status(404).json({ status: false, message: error.message })
    }
}

const getJoinedContestBySeries = async (req, res) => {
    try {
        console.log(new Date());
        const { series_id } = await req.body
        const token = await req.headers.authorization.split(" ")[1]
        const { mobile_number } = jwt.verify(token, process.env.NODE_SECRET_KEY)
        console.log(new Date());

        const contests = await Users.findAll({
            include: [{
                model: Join_contest,
                where: { 'series_id': series_id },
                include: [{
                    model: Contests,
                    attributes: { exclude: ['category_id', 'contest_size', 'entry_fee', 'min_contest_size', 'invite_code', 'admin_commision', 'contest_type', 'price_breakup', 'confirmed_winning', 'multiple_team', 'auto_create', 'status', 'createdAt', 'updatedAt'] },
                    include: [{
                        model: Contest_category
                    }]
                }]
            }],
            where: { 'mobile_number': mobile_number }
        })
        console.log(new Date());

        const category = await JSON.parse(JSON.stringify(contests[0]?.join_contests?.map(e => e?.contest)))
        console.log(new Date());

        for (let e of category) {
            e.category_name = e.contest_category.contest_name
            delete e.contest_category
        }

        let key = 'id'
        const result = [...new Map(category.map(e => [e[key], e])).values()]
        console.log(new Date());

        await res.status(200).json({ status: true, message: 'Data Found', data: result })
    }
    catch (error) {
        console.log(error.message)
        res.status(404).json({ status: false, message: error.message })
    }
}

const getLevelIncome = async (req, res) => {
    try {
        const token = await req.headers.authorization.split(" ")[1]
        const { mobile_number } = jwt.verify(token, process.env.NODE_SECRET_KEY)
        const users = await Users.findOne({where:{'mobile_number':mobile_number}})

        const referal_level1 = await Referral.count({ where: { 'referred_by': users.id } })

        const level1_income1 = await Wallet_transaction.sum('credit_amount',{ where: { 'user_id': users.id, 'transaction_type':'Referral Income' , 'referral_income_level': 1 }})

        const referal_level2 = await Referral.count({
            where: {
                referred_by: {
                    [Op.in]: sequelize.literal(
                        `(SELECT user_id FROM referrals WHERE referred_by = ${users.id})`
                    ),
                },
            },
        })

        const level2_income2 = await Wallet_transaction.sum('credit_amount', { where: { 'user_id': users.id, 'transaction_type': 'Referral Income', 'referral_income_level': 2 } })

        const referal_level3 = await Referral.count({
            where: {
                referred_by: {
                    [Op.in]: sequelize.literal(
                        `(SELECT user_id FROM referrals WHERE referred_by IN (SELECT user_id FROM referrals WHERE referred_by = ${users.id}))`
                    ),
                },
            },
        })

        const level3_income3 = await Wallet_transaction.sum('credit_amount', { where: { 'user_id': users.id, 'transaction_type': 'Referral Income', 'referral_income_level': 3 } })

        const referal_level4 = await Referral.count({
            where: {
                referred_by: {
                    [Op.in]: sequelize.literal(
                        `(SELECT user_id FROM referrals WHERE referred_by IN (SELECT user_id FROM referrals WHERE referred_by IN (SELECT user_id FROM referrals WHERE referred_by = ${users.id})))`
                    ),
                },
            },
        })

        const level4_income4 = await Wallet_transaction.sum('credit_amount', { where: { 'user_id': users.id, 'transaction_type': 'Referral Income', 'referral_income_level': 4 } })

        const referal_level5 = await Referral.count({
            where: {
                referred_by: {
                    [Op.in]: sequelize.literal(
                        `(SELECT user_id FROM referrals WHERE referred_by IN (SELECT user_id FROM referrals WHERE referred_by IN (SELECT user_id FROM referrals WHERE referred_by IN (SELECT user_id FROM referrals WHERE referred_by = ${users.id}))))`
                    ),
                },
            },
        })

        const level5_income5 = await Wallet_transaction.sum('credit_amount', { where: { 'user_id': users.id, 'transaction_type': 'Referral Income', 'referral_income_level': 5 } })

        const referal_level6 = await Referral.count({
            where: {
                referred_by: {
                    [Op.in]: sequelize.literal(
                        `(SELECT user_id FROM referrals WHERE referred_by IN (SELECT user_id FROM referrals WHERE referred_by IN (SELECT user_id FROM referrals WHERE referred_by IN (SELECT user_id FROM referrals WHERE referred_by IN (SELECT user_id FROM referrals WHERE referred_by = ${users.id})))))`
                    ),
                },
            },
        })

        const level6_income6 = await Wallet_transaction.sum('credit_amount', { where: { 'user_id': users.id, 'transaction_type': 'Referral Income', 'referral_income_level': 6 } })

        const referal_level7 = await Referral.count({
            where: {
                referred_by: {
                    [Op.in]: sequelize.literal(
                        `(SELECT user_id FROM referrals WHERE referred_by IN (SELECT user_id FROM referrals WHERE referred_by IN (SELECT user_id FROM referrals WHERE referred_by IN (SELECT user_id FROM referrals WHERE referred_by IN (SELECT user_id FROM referrals WHERE referred_by IN (SELECT user_id FROM referrals WHERE referred_by = ${users.id}))))))`
                    ),
                },
            },
        })

        const level7_income7 = await Wallet_transaction.sum('credit_amount', { where: { 'user_id': users.id, 'transaction_type': 'Referral Income', 'referral_income_level': 7 } })

        const referal_level8 = await Referral.count({
            where: {
                referred_by: {
                    [Op.in]: sequelize.literal(
                        `(SELECT user_id FROM referrals WHERE referred_by IN (SELECT user_id FROM referrals WHERE referred_by IN (SELECT user_id FROM referrals WHERE referred_by IN (SELECT user_id FROM referrals WHERE referred_by IN (SELECT user_id FROM referrals WHERE referred_by IN (SELECT user_id FROM referrals WHERE referred_by IN (SELECT user_id FROM referrals WHERE referred_by = ${users.id})))))))`
                    ),
                },
            },
        })

        const level8_income8 = await Wallet_transaction.sum('credit_amount', { where: { 'user_id': users.id, 'transaction_type': 'Referral Income', 'referral_income_level': 8 } })

        const referal_level9 = await Referral.count({
            where: {
                referred_by: {
                    [Op.in]: sequelize.literal(
                        `(SELECT user_id FROM referrals WHERE referred_by IN (SELECT user_id FROM referrals WHERE referred_by IN (SELECT user_id FROM referrals WHERE referred_by IN (SELECT user_id FROM referrals WHERE referred_by IN (SELECT user_id FROM referrals WHERE referred_by IN (SELECT user_id FROM referrals WHERE referred_by IN (SELECT user_id FROM referrals WHERE referred_by IN (SELECT user_id FROM referrals WHERE referred_by = ${users.id}))))))))`
                    ),
                },
            },
        })

        const level9_income9 = await Wallet_transaction.sum('credit_amount', { where: { 'user_id': users.id, 'transaction_type': 'Referral Income', 'referral_income_level': 9 } })

        const referal_level10 = await Referral.count({
            where: {
                referred_by: {
                    [Op.in]: sequelize.literal(
                        `(SELECT user_id FROM referrals WHERE referred_by IN (SELECT user_id FROM referrals WHERE referred_by IN (SELECT user_id FROM referrals WHERE referred_by IN (SELECT user_id FROM referrals WHERE referred_by IN (SELECT user_id FROM referrals WHERE referred_by IN (SELECT user_id FROM referrals WHERE referred_by IN (SELECT user_id FROM referrals WHERE referred_by IN (SELECT user_id FROM referrals WHERE referred_by IN (SELECT user_id FROM referrals WHERE referred_by = ${users.id})))))))))`
                    ),
                },
            },
        })

        const level10_income10 = await Wallet_transaction.sum('credit_amount', { where: { 'user_id': users.id, 'transaction_type': 'Referral Income', 'referral_income_level': 10 } })

        const result = []
        result.push({ 'level': 1, 'income_count': referal_level1, 'income': level1_income1 }, { 'level': 2, 'income_count': referal_level2, 'income': level2_income2 }, { 'level': 3, 'income_count': referal_level3, 'income': level3_income3 }, { 'level': 4, 'income_count': referal_level4, 'income': level4_income4 }, { 'level': 5, 'income_count': referal_level5, 'income': level5_income5 }, { 'level': 6, 'income_count': referal_level6, 'income': level6_income6 }, { 'level': 7, 'income_count': referal_level7, 'income': level7_income7 }, { 'level': 8, 'income_count': referal_level8, 'income': level8_income8 }, { 'level': 9, 'income_count': referal_level9, 'income': level9_income9 }, { 'level': 10, 'income_count': referal_level10, 'income': level10_income10 })

        res.status(200).json({ status: true, message: 'Data Found', data: result })
    }
    catch (error) {
        console.log(error.message)
        res.status(404).json({ status: false, message: error.message })
    }
}

const joinedContestEarnings = async (req, res) => {
    try {
        const token = await req.headers.authorization.split(" ")[1]
        const { mobile_number } = jwt.verify(token, process.env.NODE_SECRET_KEY)
        const transactions = await Users.findAll({
            include: [{
                model: Wallet_transaction,
                where: { 'transaction_type': 'Group Level Income' }
            }],
            where: { 'mobile_number': mobile_number }
        })

        // console.log(transactions)
        var datas = []
        if (transactions.length) {
            datas.push(await JSON.parse(JSON.stringify(
                transactions[0]?.wallet_transactions?.reduce((prev, next) => {
                    prev[next.level] = prev[next.level] || [];
                    prev[next.level].push(next);
                    return prev;
                }, Object.create(null))
            )))
        }
        else datas = []

        const keyList = Object.keys(JSON.parse(JSON.stringify(datas[0])))

        var result = []
        for (let key of keyList) {
            var sum = 0
            datas[0][key].map(e => {
                sum += Number(e.credit_amount)
            })
            result.push({ ['earnings']: sum, level: key })
        }

        await res.status(200).json({ status: true, message: 'Data Found', data: result })
    }
    catch (error) {
        console.log(error)
        res.status(404).json({ status: false, message: error.message })
    }
}


module.exports = {
    getSeries,
    getJoinedContestBySeries,
    getLevelIncome,
    joinedContestEarnings
}