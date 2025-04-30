const jwt = require('jsonwebtoken')
const { Bank_details, Pan_aadhar_details, Transactions, Users, Transaction_type, Referral, Contests, Upcoming_breakup, Join_contest, Fixtures, CaptainViceCaptain, Wallet_transaction, Match_contest, Notifications } = require('../models')
const { pagination, fetch_user } = require('../helpers')
const referral = require('../models/referral')
const s3 = require('../config/awsconfig')
const { Op } = require('sequelize')
const Sequelize = require('sequelize')
const { notification } = require('.')

const getReferralCode = async (req, res) => {
    try {
        const token = await req.headers.authorization.split(" ")[1]
        const { mobile_number } = jwt.verify(token, process.env.NODE_SECRET_KEY)
        const referral = await Users.findOne({ include: [Referral], where: { 'mobile_number': mobile_number } })
        const { invite_code } = await referral
        const referred_count = referral.referrals[0] ? referral.referrals[0].referred_count : 0
        res.status(200).json({ status: true, message: "Data Found", data: { invite_code, referred_count } })
    }
    catch (error) {
        console.log(error.message)
        res.status(200).json({ status: 400, message: error.message })
    }
}

const withdraw_cash = async (req, res) => {
    try {
        const token = await fetch_user(req.headers.authorization.split(" ")[1])
        const fetch_details = await Users.findAll({
            where: { id: token.id },
            include: [
                { model: Pan_aadhar_details },
                { model: Bank_details }
            ]
        })

        const user_details = {
            mobile_no: fetch_details[0].mobile_number,
            email: fetch_details[0].email,
            email_verify: false,
            pan_verify: fetch_details[0].pan_aadhar_detail.is_verified,
            bank_account_verify: fetch_details[0].bank_detail.is_verified
        }

        res.status(200).json({
            status: true,
            data: user_details
        })
    } catch (error) {
        res.status(400).json({
            data: error.message
        })
    }
}

const verify_pan = async (req, res) => {
    try {
        const token = await fetch_user(req.headers.authorization.split(" ")[1])
        const { pan_name, pan_number, date_of_birth, state } = req.body
        const fetch_image = req.files
        const verify_pan = await Pan_aadhar_details.findOne({
            where: {
                user_id: token.id
            }
        })

        if (!pan_name || !pan_number || !date_of_birth || !state) {
            return (
                res.status(400).json({
                    status: false,
                    message: 'Missing required fields',
                    data: []
                })
            )
        }

        if (fetch_image?.length) {
            const upload_params = {
                Bucket: process.env.AWS_BUCKET_NAME,
                Key: fetch_image[0].originalname,
                Body: Buffer.from(fetch_image[0].buffer),
                ContentType: fetch_image[0].mimetype
            }

            s3.upload(upload_params, async (err, data) => {
                err & console.log('error', err);
                data & console.log(data, data.Location);
                data & await Pan_aadhar_details.create({
                    user_id: token.id,
                    pan_card: pan_number,
                    pan_image: data.Location,
                    pan_name,
                    date_of_birth,
                    state,
                    is_verified: 1
                })
            })
        } else {
            if (verify_pan) {
                await Pan_aadhar_details.update({
                    pan_card: pan_number,
                    pan_image: null,
                    pan_name,
                    date_of_birth,
                    state,
                    is_verified: 1
                }, {
                    where: {
                        user_id: token.id
                    }
                })
            } else {
                await Pan_aadhar_details.create({
                    user_id: token.id,
                    pan_card: pan_number,
                    pan_image: null,
                    pan_name,
                    date_of_birth,
                    state,
                    is_verified: 1
                })
            }
        }

        res.status(200).json({
            status: true,
            message: 'Updated Successfully',
            data: {}
        })
    } catch (error) {
        res.status(400).json({
            data: error.message
        })
    }
}

const verify_bank = async (req, res) => {
    try {
        const token = await fetch_user(req.headers.authorization.split(" ")[1])
        const { account_no, ifsc_code, bank_name, branch } = req.body
        const fetch_image = req.files
        const verify_bank = await Bank_details.findOne({
            where: {
                user_id: token.id
            }
        })
        if (!account_no || !ifsc_code || !bank_name || !branch) {
            return (
                res.status(400).json({
                    status: false,
                    message: 'Missing required fields',
                    data: []
                })
            )
        }

        if (fetch_image?.length) {
            const upload_params = {
                Bucket: process.env.AWS_BUCKET_NAME,
                Key: fetch_image[0].originalname,
                Body: Buffer.from(fetch_image[0].buffer),
                ContentType: fetch_image[0].mimetype
            }

            s3.upload(upload_params, async (err, data) => {
                err & console.log('error', err);
                data & console.log(data, data.Location);
                data & await Bank_details.create({
                    user_id: token.id,
                    account_number: account_no,
                    ifsc_code,
                    bank_name,
                    bank_image: data.Location,
                    branch,
                    is_verified: 1
                })
            })
        } else {
            if (verify_bank) {
                await Bank_details.update({
                    account_number: account_no,
                    ifsc_code,
                    bank_name,
                    bank_image: null,
                    branch,
                    is_verified: 1
                }, {
                    where: {
                        user_id: token.id
                    }
                })
            } else {
                await Bank_details.create({
                    user_id: token.id,
                    account_number: account_no,
                    ifsc_code,
                    bank_name,
                    bank_image: null,
                    branch,
                    is_verified: 1
                })
            }
        }

        res.status(200).json({
            status: true,
            message: 'Updated Successfully',
            data: {}
        })
    } catch (error) {
        res.status(400).json({
            data: error.message
        })
    }
}

const user_transactions = async (req, res) => {
    try {
        const token = await fetch_user(req.headers.authorization.split(" ")[1])
        const page = req.query.page ? req.query.page : 1
        const from = (req.query.from && req.query.from + ' 00:00:00')
        const to = (req.query.to && req.query.to + ' 23:00:00')           
           
        const limit = 20
        const paginate = pagination(page, limit)
        const totalPages = Math.ceil(await Transactions.count({
            where: !(from && to) ? { user_id: token.id } : {
                txn_date: {
                    [Op.between]: [from, to]
                },
                user_id: token.id
            }
        }) / limit)
        const fetch_transactions = await Transactions.findAll({
            where: !(from && to) ? { user_id: token.id } : {
                txn_date: {
                    [Op.between]: [from, to]
                },
                user_id: token.id
            },
            attributes: ['user_id', 'trans_type_id', 'txn_id', 'txn_date', 'txn_amount'],
            order: [['txn_date', 'DESC']],
            include: [{
                model: Transaction_type,
                attributes: ['transactions_name', 'id']
            }],
            offset: paginate.offset,
            limit: paginate.limit,
        })

        // const datas = fetch_transactions.reduce(function (prev, next) {
        //     prev[next.txn_date] = prev[next.txn_date] || [];
        //     prev[next.txn_date].push(next);
        //     return prev;
        // }, Object.create(null))

        const modify_transactions = fetch_transactions.map(e => {
            return (
                {
                    amount: `${(e.transactions_type.id === 3 || e.transactions_type.id === 9) ? '-' : '+'}${e.txn_amount}`,
                    txn_type: e.transactions_type.transactions_name,
                    transaction_id: e.txn_id,
                    txn_date: e.txn_date,
                    team_name: token.user_team
                }
            )
        })

        res.status(200).json({
            status: true,
            message: 'data found',
            data: {
                data: modify_transactions,
                currentPages: page,
                totalPages
            },
        })
    } catch (error) {
        res.status(400).json({
            status: false,
            message: error.message
        })
    }
}

const user_profile = async (req, res) => {
    try {
        const token = await fetch_user(req.headers.authorization.split(" ")[1])
        const fetch_details = await Users.findAll({
            where: { id: token.id },
            include: [
                {
                    model: Referral,
                    include: [Users]
                },
                {
                    model: Join_contest,
                    include: [{
                        model: Contests,
                        include: [Match_contest],
                    }]
                },
                {
                    model: Pan_aadhar_details,
                },
                {
                    model: Bank_details
                }]
        })

        const fetch_referral = await Referral.findAll({
            where: {
                referred_by: token.id
            },
            limit: 6,
            include: [Users]
        })

        const fetch_all_referral = await Referral.findAll()

        const get_counts = (data) => {
            const counts = {
                paid_contest: data[0].join_contests.filter(e => e.contest.entry_fee > 0).length,
                total_series: [... new Set(fetch_details[0].join_contests.map(x => x.series_id))].length,
                total_match: [... new Set(fetch_details[0].join_contests.map(x => x.fixture_id))].length,
                series_wins: "",
                referrals: ""
            }
            return counts
        }

        const joined_contest = fetch_details[0]?.join_contests ? fetch_details[0].join_contests : []

        const unique_contest = [... new Set(joined_contest.map(x => x.contest_id))]

        const unique_array = []

        for (let i = 0; i < unique_contest.length; i++) {
            unique_array.push(joined_contest.find(e => e.contest_id === unique_contest[i]))
        }
        const count = await Notifications.count({
            where: { user_id: token.id, status: 1 }
          });  // :contentReference[oaicite:0]{index=0}
        
        const level_income = await Wallet_transaction.sum('credit_amount', { where: { 'user_id': token.id, 'transaction_type': 'Referral Income' } })
        const group_income = await Wallet_transaction.sum('credit_amount', { where: { 'user_id': token.id, 'transaction_type': 'Group Level Income' } })

        const modify_data = fetch_details.map(user => {
            return ({
                user_id: user.id,
                team_name: user.user_team,
                name: fetch_details[0].user_name,
                email: fetch_details[0].email,
                date_of_birth: fetch_details[0].date_of_birth,
                address: fetch_details[0].address,
                city: fetch_details[0].city,
                pinCode: fetch_details[0].pincode,
                country: fetch_details[0].country,
                state: fetch_details[0].state,
                gender: fetch_details[0].gender,
                mobile_no: fetch_details[0].mobile_number,
                paid_contest_count: get_counts(fetch_details).paid_contest,
                cashback: Number(group_income) ? Number(group_income) : 0,
                winnings: Number(fetch_details[0].winning_amount),
                cash_deposit: Number(fetch_details[0].cash_balance),
                level_income: Number(level_income) ? Number(level_income) : 0, 
                withdrawabale_amount:  Number(fetch_details[0].winning_amount),
                non_withdrawabale_amount:  Number(group_income) + Number(level_income)  + Number(fetch_details[0].cash_balance) + Number(fetch_details[0].bonus_amount),
                bonus: Number(fetch_details[0].bonus_amount),
                invite_friend_code: fetch_details[0].invite_code,
                contest_finished: unique_array.filter(arr => arr.contest?.match_contests[0]?.is_cancelled !== 1)?.length,
                total_match: get_counts(fetch_details).total_match,
                total_series: get_counts(fetch_details).total_series,
                series_wins: "",
                team_name_updated: fetch_details[0].is_updated === 1,
                pan_number: user?.pan_aadhar_detail?.pan_card ? user?.pan_aadhar_detail?.pan_card : "",
                account_number: user?.bank_detail?.account_number ? user?.bank_detail?.account_number.toString() : "",
                image: user.image ? user.image : "",
                refered_to_friend: fetch_referral.map((u) => {
                    return ({
                        name: u.user?.user_team,
                        image: u.user?.image ? u.user?.image : "",
                        reffered_count: fetch_all_referral.filter(e => e.referred_by === u.user?.id)?.length
                    })
                }),
                referral_bonus: "",
                account_verified: (user.bank_detail?.is_verified === 2 && user.pan_aadhar_detail?.is_verified === 2) ? 1 : 0,
                bank_verify: user.bank_detail?.is_verified ? user.bank_detail?.is_verified : 0,
                pan_verify: user.pan_aadhar_detail?.is_verified ? user.pan_aadhar_detail?.is_verified : 0,
                isNotifications: false //count > 0,
            })
        })

        res.status(200).json({
            status: true,
            message: "success",
            data: modify_data[0]
        })
    } catch (error) {
        console.log(error)
        res.status(400).json({
            status: false,
            data: error.message
        })
    }
}

const update_team_name = async (req, res) => {
    try {
        const token = await fetch_user(req.headers.authorization.split(" ")[1])
        const { team_name } = req.body
        if (!team_name) res.status(400).json({
            status: false,
            message: 'team name should not be empty'
        })

        const users = await Users.findOne({
            where: { user_team: team_name }
        })

        if (users) {
            return res.status(400).json({
                status: false,
                message: 'team name already existed',
                data: {}
            })
        } else {
            await Users.update({ user_team: team_name, is_updated: 1 }, { where: { "id": token.id } })
        }

        res.status(200).json({
            status: true,
            message: 'user team updated successfully',
            data: {}
        })
    } catch (error) {

    }
}

const update_user_profile = async (req, res) => {
    try {
        const token = await fetch_user(req.headers.authorization.split(" ")[1])
        const { name, email, gender, date_of_birth, address, city, state, country, pincode } = req.body

        const updated_user = await Users.update(
            {
                user_name: name,
                email,
                gender,
                date_of_birth,
                address,
                country,
                state,
                city,
                pincode
            }, { where: { id: token.id } })

        const user = await Users.findAll({
            where: { id: 4 },
            attributes: { exclude: ['is_updated', 'is_verified', 'createdAt', 'updatedAt'] }
        })

        res.status(200).json({
            status: true,
            message: 'Profile updated successfully',
            data: {}
        })

    } catch (error) {
        res.status(400).json({
            status: false,
            message: error.message,
            data: {}
        })
    }
}

const upload_image = async (req, res) => {
    try {
        const token = await fetch_user(req.headers.authorization.split(" ")[1])
        const fetch_image = req.files

        if (fetch_image) {
            const upload_params = {
                Bucket: process.env.AWS_BUCKET_NAME,
                Key: fetch_image.image.name,
                Body: Buffer.from(fetch_image.image.data),
                ContentType: fetch_image.image.mimetype
            }

            s3.upload(upload_params, async (err, data) => {
                err & console.log('error', err);
                data & console.log(data, data.Location);
                data & await Users.update({
                    image: data.Location
                }, { where: { id: token.id } })
            })
        } else {
            return (
                res.status(400).json({
                    status: false,
                    message: 'missing image field',
                    data: {}
                })
            )
        }

        res.status(200).json({
            status: true,
            message: 'Updated Successfully',
            data: {}
        })
    } catch (error) {
        res.status(400).json({
            status: false,
            message: error.message,
            data: {}
        })
    }
}

const mlm_wallet = async (req, res) => {
    try {
        const token = await fetch_user(req.headers.authorization.split(" ")[1])
        const user = await Users.findAll({
            where: {
                id: token.id
            },
            include: [{
                model: Join_contest,
            },
            {
                model: CaptainViceCaptain
            }]
        })

        const level_income = await Wallet_transaction.sum('credit_amount', { where: { 'user_id': token.id, 'transaction_type': 'Referral Income' } })
        const group_income = await Wallet_transaction.sum('credit_amount', { where: { 'user_id': token.id, 'transaction_type': 'Group Level Income' } })

        const modify_data = {
            joined_contest: [...new Set(user[0].join_contests.map(e => e.contest_id))].length,
            joined_teams: [...new Set(user[0].join_contests.map(e => e.player_team_id))].length,
            cashback: Number(group_income) ? Number(group_income) : 0,
            winnings: Number(user[0].winning_amount),
            cash_deposit: Number(user[0].cash_balance),
            level_income: Number(level_income) ? Number(level_income) : 0,
            withdrawabale_amount:  Number(user[0].winning_amount),
            non_withdrawabale_amount: Number(user[0].cash_balance) + Number(user[0].bonus_amount) + Number(group_income) + Number(level_income),
            bonus: Number(user[0].bonus_amount),
            account_verified: user[0].is_verified
        }

        res.status(200).json({
            status: true,
            message: "MLM Earning Wallet",
            data: modify_data
        })
    } catch (error) {
        res.status(400).json({
            status: false,
            message: error.message
        })
    }
}

const withdraw_details = async (req, res) => {
    try {
        const token = await fetch_user(req.headers.authorization.split(" ")[1])
        const get_user = await Users.findAll({
            where: {
                id: token.id
            },
            include: [Bank_details]
        })

        const user = get_user[0]

        const modify_data = {
            bank_name: user.bank_detail?.bank_name || '',
            account_number: user.bank_detail?.account_number || '',
            ifsc_code: user.bank_detail?.ifsc_code || '',
            branch: user.bank_detail?.branch || '',
            total_withdraw_cash: (Number(user.winning_amount) /* + user.cashback + user.level_income + user.bonus_amount */),
            winning_amount: Number(user?.winning_amount) || '',
            cash_back: Number(user?.cashback) || '',
            level_income: Number(user?.level_income) || '',
            bonus_amount: Number(user?.bonus_amount) || '',
        }

        res.status(200).json({
            status: true,
            message: "fetched withdraw details successfully",
            data: modify_data
        })
    } catch (error) {
        res.status(400).json({
            status: false,
            message: error.message,
            data: {}
        })
    }
}

const referrals = async (req, res) => {
    try {        
        const page = eval(req.query.page ? req.query.page : 1)
        const token = await fetch_user(req.headers.authorization.split(" ")[1])
        const fetch_users = await Users.findAll({
            attributes: ['id', 'user_name', 'image', 'referred_by'],
            where: {
                id: {
                    [Op.not]: token.id
                }
            },
            include: [{
                model: Referral,
                attributes: ['referral_id', 'user_id', 'referred_by'],
            }]
        })
        
        const limit = 25
        const paginate = pagination(page, limit)

        const fetch_referral = await Referral.findAll({
            attributes: ['referral_id', 'user_id', 'referred_by'],
            where : {
                referred_by : token.id
            },
            offset: paginate.offset,
            limit: paginate.limit,
            include:[{
                model: Users,
                attributes: ['id', 'user_team', 'image', 'referred_by'],
            },            
        ]
        })

        const total_fetch_referral = await Referral.findAndCountAll({
            attributes: ['referral_id', 'user_id', 'referred_by'],
            where : {
                referred_by : token.id
            },
            include:[{
                model: Users,
                attributes: ['id', 'user_team', 'image', 'referred_by'],
            },            
        ]
        })

        const totalPages = Math.ceil(total_fetch_referral.count / limit)

        // const refer_user = fetch_referral.filter(e => e.referred_by === token.id)

        const modify_data = fetch_referral.map(e => {
            return ({
                name: e.user?.user_team ? e.user?.user_team : "",
                image: e.user?.image ? e.user?.image : "",
                // referred_count: fetch_referral.filter(j => j.referred_by === e.user_id).length
            })
        })

        res.status(200).json({
            status: true,
            message: "fetched refer friends data",
            data: {
              data: modify_data,
              totalPages,
              currentPages: page
            },
        })
        
    } catch (error) {
        res.status(400).json({
            status: false,
            message: error.message,
            data: {}
        })
    }
} 

const player_details = async (req, res) => {
    try {
        const token = await fetch_user(req.headers.authorization.split(" ")[1])
        const {friend_user_id} = req.body
        if (!friend_user_id) return res.status(400).json({
            message : 'friend_user_id field is required',
            data: {}
        })

        const user_team = await Users.findAll({
            where : {
                id: [token.id, friend_user_id],                
            },
            include: [Join_contest]
        })  

        const fetch_friend_id = user_team.find(e => e.id === friend_user_id)
        
        const series_count = [... new Set(fetch_friend_id?.join_contests.map(x => x.series_id))].length
        
        const fixture_count = [... new Set(fetch_friend_id?.join_contests.map(x => x.fixture_id))].length
        
        const contest_count = [... new Set(fetch_friend_id?.join_contests.map(x => x.contest_id))].length

        const contest_winnings = fetch_friend_id.join_contests.filter(x => x.position === 1).length

        const modify_data = {
            team_name: fetch_friend_id.user_name || "" ,
            image: fetch_friend_id.image ||  "",
            contest_finished: contest_count,
            total_match: fixture_count,
            total_series: series_count,
            series_wins : contest_winnings,
        }

        res.status(200).json({
            message : 'user data fetched successfully',
            data: modify_data
        })
    } catch (error) {
        res.status(400).json({
            message : error.message,
            data: {}
        })
    }
}

const user_team_comparison = async (req, res) => {
    try {
        const token = await fetch_user(req.headers.authorization.split(" ")[1])
        const {friend_user_id} = req.body
        const page = req.query.page || 1
        const limit = 10
        const paginate = pagination(page, limit)
        if (!friend_user_id) return res.status(400).json({
            message : 'friend_user_id field is required',
            data: {}
        })

        const user_team = await Users.findAll({
            where : {
                id: [token.id, friend_user_id],                
            },
            include: [{
                model : Join_contest,
                include: [Fixtures]
            }]
        })  

        const pag = await Join_contest.findAll({
            where: {
                user_id : 20
            },
            group : ['fixture_id'],
            // attributes : ['fixture_id'],
            // attributes: [
            //     'fixture_id',Sequelize.fn('MAX', Sequelize.col('player_points'))
            //  ]
        })

        // const fetch_friend_id = user_team.find(e => e.id === friend_user_id)
        
        // const fetch_my_id = user_team.find(e => e.id === token.id)        
        
        // const fixture_count = [... new Set(fetch_my_id?.join_contests.map(x => x.fixture_id))].length

        // const recent_performance = []


        // recent_performance.map((e, i) => {
        //     modify_data.recent_performance.push(recent_performance[i])
        // })

        res.status(200).json({
            message : 'data fetched',
            data : pag
        })

    } catch (error) {
        res.status(400).json({
            message : error.message,
            data: {}
        })
    }
}

module.exports = {
    withdraw_cash,
    verify_pan,
    verify_bank,
    user_transactions,
    user_profile,
    update_team_name,
    update_user_profile,
    upload_image,
    getReferralCode,
    mlm_wallet,
    withdraw_details,
    referrals,
    player_details,
    user_team_comparison
}
