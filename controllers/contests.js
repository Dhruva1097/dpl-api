const { Contests, Contest_category, Match_contest, Upcoming_breakup, Join_contest, Setting, Fixtures, Users, CaptainViceCaptain, Live_breakup, Performance, UserTeam, Teams, Groups, sequelize, Wallet_transaction, Squads, Transactions, Sequelize } = require('../models')
const { pagination, fetch_user } = require('../helpers')
const { Op } = require("sequelize");
const { con_schema } = require('../validation/contestSchema');
const Joi = require('joi');
const squads = require('../models/squads');
const moment = require("moment-timezone");

const contest = async (req, res) => {
    try {
        console.log("contest");
        const token = await fetch_user(req.headers.authorization.split(" ")[1])
        const { match_id } = req.body
        if (!match_id) {
            return res.status(400).json({
                status: false,
                message: 'match id is required'
            })
        }

        const fixture_contest = await Match_contest.findAll({
            where: { 'fixture_id': match_id },
            // raw : true,
            include: [{
                model: Contests,
                include: [Contest_category],
            }, {
                model: Contests,
                include: [{
                    model: Upcoming_breakup,
                    attributes: ["name", "prize", "start", "end"]
                }]
            },
            {
                model: Contests,
                // include: [Join_contest]
            },
            {
                model: Fixtures,
                include: [{
                    where: { user_id: token.id },
                    model: CaptainViceCaptain
                }]
            }]
        })

        const fetch_joined_contest = await Join_contest.findAndCountAll({
            where: { 'fixture_id': match_id }
        })

        const fetch_my_contest = await Join_contest.findAndCountAll({
            where: { 'fixture_id': match_id, user_id: token.id }
        })

        const joined_contest = fetch_joined_contest.rows

        if (!fixture_contest?.length) {
            return res.status(200).json({
                status: true,
                data: fixture_contest,
                message: 'no Contest'

            })
        }
        const match_contest = []
        const unique = [... new Set(fixture_contest.map(x => x.contest.category_id))];
        for (let i = 0; i < unique.length; i++) {
            const data = fixture_contest.find((e) => e.contest.category_id === unique[i])
            match_contest.push({
                category_title: data.contest.contest_category.contest_name,
                category_desc: data.contest.contest_category.description,
                category_image: data.contest.contest_category.image,
                category_id: data.contest.contest_category.id,
                contests: fixture_contest.filter(e => e.contest.category_id === unique[i]).map(e => {
                    return {
                        confirm_winning: e.contest.confirmed_winning,
                        entry_fee: e.contest.entry_fee,
                        prize_money: e.contest.winning_amount,
                        total_teams: e.contest.contest_size,
                        contest_id: e.contest.id,
                        total_winners: e.contest.upcoming_breakups.reverse()[0]?.end,
                        teams_joined: joined_contest.filter(j => (j.contest_id === e.contest_id)).length,
                        is_joined: joined_contest.filter(j => (j.user_id === token.id && j.contest_id === e.contest_id)).length >= 1 ? true : false,
                        multiple_teams: e.contest.multiple_team,
                        invite_code: e.contest.invite_code,
                        use_bonus: "",
                        breakup_details: e.contest?.upcoming_breakups?.reverse()?.map(e => {
                            return {
                                name: e.name,
                                prize: e.prize
                            }
                        }),
                        my_teams: joined_contest.filter(j => (j.user_id === token.id && j.contest_id === e.contest_id)).length,
                        is_infinite: false,
                        infinite_breakup: {
                            winner_percent: null,
                            winner_amount: null
                        }
                    }
                })
            })

        }

        const contest = {
            match_contest,
            my_teams_count: fixture_contest[0].fixture ? fixture_contest[0].fixture.userteam_cap_vices?.length : 0,
            my_teams: fixture_contest[0].fixture ? fixture_contest[0].fixture.userteam_cap_vices.map(e => e.id) : [],
            my_contests: [... new Set(fetch_my_contest.rows.map(x => x.contest_id))].length
        }
        res.status(200).json({
            status: true,
            message: "contest retrieved successfully",
            data: contest
        })
    } catch (err) {
        res.status(400).json({
            data: err.message
        })
    }
}

const Total_contest = async (req, res) => {
    try {
        const page = req.query.page ? req.query.page : 1
        // const {value, error} = con_schema(req.body)
        const { match_id, filter_key, filter_type, category_id, entry_fee, winnings, contest_type, contest_size } = req.body
        const token = await fetch_user(req.headers.authorization.split(" ")[1])
        const limit = 10
        const paginate = pagination(page, limit)

        const modify_data = {
            entry_fee: [
                [1, 100],
                [101, 1000],
                [1001, 5000],
                [5001, null]
            ],
            winnings: [
                [1, 10000],
                [100001, 500000],
                [500001, 1000000],
                [100001, 1000000],
                [1000001, 2500000],
                [2500001, null]
            ],
            contest_type: ['Multi Entry', 'Multi Winner', 'Confirmed'],
            contest_size: [
                [2],
                [3, 10],
                [11, 20],
                [21, 100],
                [101, 1000],
                [1001, 10000],
                [10001, 50000],
                [50001, null]
            ]
        }

        const entry_fee_length = []
        const entry_data = []
        const winning_length = []
        const winning_data = []
        const size_length = []
        const contest_size_data = []

        if (entry_fee.length) {
            entry_fee.map(e => (
                entry_fee_length.push(modify_data.entry_fee[e])
            ))
            entry_fee_length.map((e, i) => {
                const data = e.find(j => j === null) !== null ? { entry_fee: { [Op.between]: [e[0], e[1]] } } : { entry_fee: { [Op.gt]: e[0] } }
                entry_data.push(data)
                // return (
                //     {[Op.and]:[
                //         {entry_fee : {[Op.between] : [1, 2]}},
                //         {entry_fee : {[Op.between] : [3, 4]}},
                //         {entry_fee : {[Op.between] : [5, 6]}}
                //     ]}
                // )
            })
        }

        if (winnings.length) {
            winnings.map(e => (
                winning_length.push(modify_data.winnings[e])
            ))
            winning_length.map((e, i) => {
                const data = e.find(j => j === null) !== null ? { winning_amount: { [Op.between]: [e[0], e[1]] } } : { winning_amount: { [Op.gt]: e[0] } }
                winning_data.push(data)
            })
        }

        if (contest_size.length) {
            contest_size.map(e => (
                size_length.push(modify_data.contest_size[e])
            ))
            size_length.map((e, i) => {
                const data = e.find(j => j === 2) === 2 ? { contest_size: { [Op.between]: [e[0], e[0]] } } : e.find(j => j === null) !== null ? { contest_size: { [Op.between]: [e[0], e[1]] } } : { contest_size: { [Op.gt]: e[0] } }
                contest_size_data.push(data)
            })
        }

        const custom_data = {
            entry_fee: !entry_fee.length ? [] : entry_fee_length,
            winnings: !winnings.length ? [] : winning_length,
            contest_type,
            contest_size: !contest_size.length ? [] : size_length
        }

        if (!match_id) {
            return res.status(400).json({
                status: false,
                message: 'match id is required'
            })
        }

        const sorting = (key, type) => {
            if (key === 1) {
                return type ? ['entry_fee', 'ASC'] : ['entry_fee', 'DESC']
            } else if (key === 2) {
                return type ? ['winning_amount', 'ASC'] : ['winning_amount', 'DESC']
            } else if (key === 3) {
                return type ? ['entry_fee', 'ASC'] : ['entry_fee', 'DESC']
            } else if (key === 4) {
                return type ? ['contest_size', 'ASC'] : ['contest_size', 'DESC']
            }
            else {
                return ['id', 'ASC']
            }
        }

        const filter_condition = {
            category_id: category_id !== "" ? category_id : { [Op.not]: null },
        }

        if (entry_fee.length) {
            filter_condition[Op.or] = entry_data
        } else {
            filter_condition['entry_fee'] = { [Op.not]: null }
        }

        if (winnings.length) {
            filter_condition[Op.or] = winning_data
        } else {
            filter_condition['winning_amount'] = { [Op.not]: null }
        }

        if (contest_size.length) {
            filter_condition[Op.or] = contest_size_data
        } else {
            filter_condition['contest_size'] = { [Op.not]: null }
        }

        const total_contest = await Contests.findAll({
            where: filter_condition,
            order: [sorting(filter_key, filter_type)],
            offset: paginate.offset,
            limit: paginate.limit,
            include: [{
                model: Match_contest,
                where: { "fixture_id": match_id },
                order: [['id', 'DESC']],
                attributes: []
            }, {
                model: Upcoming_breakup,
                attributes: { exclude: ['id', 'fixture_id', 'contest_id', 'percentage', 'createdAt', 'updatedAt', 'contest'] }
            }
            ]
        })

        const totalPages = Math.ceil(total_contest.length / limit)

        const fetch_joined_contest = await Join_contest.findAndCountAll({
            where: { 'fixture_id': match_id },
            include: [{
                model: Fixtures,
                attributes: ['id'],
                // include: [CaptainViceCaptain]
            }]
        })

        const my_contest_count = await Join_contest.count({ where: { user_id: token.id, fixture_id: match_id } })

        const joined_contest = fetch_joined_contest.rows

        const contest = total_contest.map(e => {
            return {
                confirm_winning: e.confirmed_winning,
                entry_fee: e.entry_fee,
                category_id: e.category_id,
                prize_money: e.winning_amount,
                total_teams: e.contest_size,
                contest_id: e.id,
                total_winners: e.upcoming_breakups.reverse()[0]?.end,
                teams_joined: joined_contest.filter(j => (j.contest_id === e.id)).length,
                is_joined: joined_contest.filter(j => (j.user_id === token.id && j.contest_id === e.id)).length >= 1 ? true : false,
                multiple_teams: e.multiple_team,
                invite_code: e.invite_code,
                breakup_details: e.upcoming_breakups.reverse(),
                my_teams: my_contest_count/* joined_contest[0]?.fixture.userteam_cap_vices?.length */,
                // my_teams_count: joined_contest[0]?.fixture ? joined_contest[0]?.fixture.userteam_cap_vices?.map(e => e.id) : [],
                // is_infinite: (800 / 2000) * 100,
                is_infinite: false,
                infinite_breakup: {
                    winner_percent: null,
                    winner_amount: null
                }
            }
        })

        res.status(200).json({
            status: true,
            message: 'contest retrieved successfully',
            data: {
                data: contest,
                totalPages,
                currentPages: page
            }
        })
    } catch (err) {
        res.status(400).json({
            status: false,
            message: err.message
        })
    }
}

const verify_wallet_amount = async (req, res) => {
    try {
        const user = await fetch_user(req.headers.authorization.split(" ")[1])
        const { contest_id, team_count } = req.body
        if (!contest_id) {
            return res.status(400).json({
                status: false,
                message: 'contest id is required'
            })
        }

        const contest = await Contests.findOne({
            where: { 'id': contest_id }
        })

        const admin = await Setting.findOne({
            attributes: { exclude: ['id', 'status', 'createdAt', 'updatedAt'] }
        })

        const bonus = (entryFee) => {
            if (team_count === 1) {
                const amount = (admin.admin_percentage / 100) * entryFee
                if (amount > Number(user.bonus_amount)) {
                    return Number(user.bonus_amount)
                } else {
                    return amount
                }
            } else {
                let amount = 0
                for (let i = 0; i < team_count; i++) {
                    amount = (admin.admin_percentage / 100) * entryFee
                }
                if (amount > Number(user.bonus_amount)) {
                    return Number(user.bonus_amount)
                } else {
                    return amount
                }
            }
        }

        const wallet_data = {
            cash_balance: Number(user.cash_balance) + Number(user.winning_amount) /* + Number(user.cashback) + Number(user.level_income) */,
            usable_bonus: bonus(contest.entry_fee),
            entry_fee: (contest.entry_fee * team_count),
            usable_bonus_percent: admin.admin_percentage,
            total_amount: Number(user.cash_balance) + Number(user.winning_amount) + Number(user.cashback) + Number(user.level_income) + Number(user.bonus_amount / 2)
        }

        res.status(200).json({
            status: true,
            message: 'successfully wallet retrieved',
            data: wallet_data
        })

    } catch (err) {
        res.status(400).json({
            status: false,
            message: err.message
        })
    }
}

const join_contest = async (req, res) => {
    try {
        
        const user = await fetch_user(req.headers.authorization.split(" ")[1])
        const { series_id, match_id, team_id, contest_id } = req.body
        console.log("join_contest: ", req.body);
        if (!series_id && !match_id && !team_id && !contest_id) {
            return res.status(404).json({
                status: false,
                message: 'required field is missing'
            });
        }

        const contest = await Match_contest.findAndCountAll({
            where: {
                [Op.and]: [
                    { fixture_id: match_id },
                    { contest_id }
                ]
            },
            include: [{
                model: Contests,
                include: [{
                    model: Join_contest,
                }]
            }, {
                model: Fixtures,
                // where: { 'id': match_id }
            }]
        })

        const admin = await Setting.findOne()
        const fetch_contest = contest.rows

        if (contest.rows[0]?.fixture.status === "live") {
            return (
                res.status(200).json({
                    status: false,
                    message: 'You can not join contest, match already started'
                })
            )
        }

        let validate_team;
        // for (let i = 0; i < team_id.length; i++) {
        //     validate_team = contest.rows[0].contest.join_contests.filter(e => (e.user_id === user.id && e.player_team_id === team_id[i]))
        // }

        // if (validate_team.length && fetch_contest[0].contest.multiple_team === 0) {
        //     return (
        //         res.status(400).json({
        //             status: false,
        //             message: 'User already joined with this team'
        //         })
        //     )
        // }
        const featchedConest = fetch_contest[0].contest;
        const featchedJoinContest = fetch_contest[0].contest.join_contests;
        if ((featchedJoinContest + team_id.length) > featchedConest.contest_size) {
            console.log(featchedJoinContest)
            return (
                res.status(200).json({
                    status: false,
                    data: featchedConest.contest_size,
                    message: `${featchedConest.contest_size - featchedJoinContest} spot left, please join other contest`
                })
            )
        }

        let entryFee = fetch_contest[0].contest.entry_fee

        const admin_amount = (admin.admin_percentage / 100) * entryFee

        let bonus = 0
        let cashBalance = user.cash_balance
        let user_cashBalance = 0
        let winning = user.winning_amount

        async function changeDetail() {
            for (let i = 0; i < team_id.length; i++) {
                const group_id = await Groups.findOne({ where: { status: 'Filling' }, raw: true })
                let remaining_fee = entryFee
                let fetch_user = await Users.findOne({
                    where: { id: user.id },
                    raw: true
                })
                if (fetch_user.bonus_amount) {
                    if (admin_amount < fetch_user.bonus_amount) {
                        remaining_fee = entryFee - admin_amount
                        bonus = admin_amount
                    } else {
                        remaining_fee = entryFee - fetch_user.bonus_amount
                        bonus = fetch_user.bonus_amount
                    }
                }

                if (remaining_fee && fetch_user.cash_balance) {
                    user_cashBalance = remaining_fee
                    remaining_fee > fetch_user.cash_balance ? remaining_fee -= fetch_user.cash_balance : remaining_fee = 0
                    remaining_fee ? cashBalance = 0 : cashBalance = fetch_user.cash_balance - user_cashBalance
                }

                if (remaining_fee && fetch_user.winning_amount) {
                    winning -= remaining_fee
                }

                // const contest_count = await Join_contest.findAndCountAll({ where: { 'group_id': group_id.id }, raw: true })
                const settings = await Setting.findAll({ raw: true })
                const total_group_count = settings[0].total_group_count

                await Join_contest.create({
                    group_id: null, //group_id.id, ((contest_count.count + 1) <= total_group_count) ? group_id.id : group_id.id + 1
                    player_team_id: team_id[i],
                    user_id: user.id,
                    contest_id,
                    series_id,
                    fixture_id: match_id,
                    admin_comission: admin_amount,
                    bonus_amount: 0,
                    winning_amount: 0,
                    deposit_cash: cashBalance,
                    total_amount: 0,
                    wallet_type: 1,
                    status: 0
                })

                await Users.update({
                    cash_balance: cashBalance,
                    winning_amount: winning,
                    bonus_amount: 0
                }, {
                    where: {
                        id: fetch_user.id
                    },
                    returning: true
                })
            }
            const merchantTransactionId = 'DPL' + Date.now()
            await Transactions.create({
                user_id: user.id,
                trans_type_id: 3,
                tnx_note: `Joined A Contest`,
                txn_date: Date(),
                txn_amount: team_id.length * entryFee,
                txn_id: merchantTransactionId,
                status: 0
            })
        }

        changeDetail()

        res.status(200).json({
            status: true,
            message: 'Contest Joined Successfully',
            data: fetch_contest[0]
        })

    } catch (error) {
        res.status(400).json({
            status: false,
            message: error.message
        })
    }
}

const joined_contest = async (req, res) => {
    try {
        const { match_id, filter_key, filter_type } = req.body
        const token = await fetch_user(req.headers.authorization.split(" ")[1])
        const limit = 10
        if (!match_id) {
            console.log("no id", match_id);
            return res.status(400).json({
                status: false,
                message: 'match id is required'
            })
        }

        const match_stat = await Fixtures.findOne({ where: { id: match_id }, raw: true })

        const total_contest = await Join_contest.findAll({
            where: {
                [Op.and]: [
                    { fixture_id: match_id },
                    { user_id: token.id }
                ]
            },
            attributes: ['id', 'player_team_id', 'user_id', 'contest_id', 'player_points', 'current_rank'],
            include: [{
                model: CaptainViceCaptain,
                attributes: ["captain_id", "viceCaptain_id"],
                where: { user_id: token.id },
                include: [UserTeam]
            }, {
                model: Contests,
                include: [{
                    model: Upcoming_breakup,
                    attributes: ["name", "prize", "end"]
                }, {
                    model: Match_contest,
                    where: { fixture_id: match_id }
                }]
            }
            ]
        })

        const total_teams = await Join_contest.findAll({
            where: {
                fixture_id: match_id,
                user_id: token.id
            },
            include: [{
                model: CaptainViceCaptain,
                where: { match_id: match_id },
                include: [Squads]
                // include: [UserTeam]
            }]
        })

        const tttt = await Join_contest.findAll({
            attributes: ["contest_id"],
            where: {
                fixture_id: match_id
            }
        })

        const get_squads = await Squads.findAll()

        const duplicated_count = total_contest.map(e => e.contest_id)
        const contest_count = [...new Set(duplicated_count)]


        const live_breakup = await Live_breakup.findAll({
            where: { fixture_id: match_id },
            attributes: { exclude: ["id", "fixture_id", "winning_amount", "size", "percentage", "createdAt", "updatedAt"] }
        })


        const unique_contest = [... new Set(total_contest.map(x => x.contest_id))]

        const contest_details = []

        unique_contest.map(async e => {
            return contest_details.push(total_contest.find(j => j.contest_id === e))
        })

        const winnings = total_contest
        const contest = contest_details?.map(e => {
            // let highest_point = 0
            // for (let i = 0; i < e.length; i++) {
            //     if (e[i].player_points > highest_point) {
            //         highest_point = e[i].player_points;
            //     }
            // }
            const upcoming = e.contest?.upcoming_breakups;
            const lastBreakupEnd = (upcoming && upcoming.length > 0) ? upcoming[upcoming.length - 1] : null;
            return {
                fixture_id: e.fixture?.id,
                // fantasy_points: highest_point,
                confirm_winning: e.contest.confirmed_winning,
                entry_fee: e.contest.entry_fee,
                category_id: e.contest.category_id,
                prize_money: e.contest.winning_amount,
                total_teams: e.contest.contest_size,
                contest_id: e.contest_id,
                isCancelled: e.contest.match_contests[0].is_cancelled === 1/* e.contest.match_contests[0].is_cancelled === 1 */,
                total_winners: lastBreakupEnd?.end ?? null, // or provide a default value/* e.contest.upcoming_breakups[e.contest.upcoming_breakups?.length - 1]?.end */,
                // teams_joined: total_teams.filter(j => j.contest_id === e.contest_id)?.length,
                teams_joined: tttt.filter(j => j.contest_id === e.contest_id)?.length,
                is_joined: true,
                use_bonus: "",
                multiple_teams: e.contest.multiple_team,
                invite_code: e.contest.invite_code,
                my_teams_details: total_contest.map((k, index) => {
                    const fetch_cap_id = total_teams.find(team => team.userteam_cap_vice.id === k.player_team_id)?.userteam_cap_vice.captain_id
                    const fetch_vc_id = total_teams.find(team => team.userteam_cap_vice.id === k.player_team_id)?.userteam_cap_vice.viceCaptain_id
                    const cap_a_team = get_squads.find(player => player.player_id === fetch_cap_id)?.team_id
                    const vc_a_team = get_squads.find(player => player.player_id === fetch_vc_id)?.team_id
                    const fetch_cap_name = get_squads.find(player => player.player_id === fetch_cap_id)?.player_short_name
                    const fetch_vc_name = get_squads.find(player => player.player_id === fetch_vc_id)?.player_short_name
                    if (k.contest_id == e.contest_id) {
                        return ({
                            team_id: k.player_team_id,
                            // cap_team: e.fixture.team_a_id === cap_a_team ? true : false,
                            // vc_team: e.fixture.team_a_id === vc_a_team ? true : false,
                            team_name: k.userteam_cap_vice.userteams[0]?.team_count,
                            in_winning_zone: match_stat.status.toLowerCase() == 'upcoming' ? false : e.contest.upcoming_breakups[e.contest.upcoming_breakups.length - 1]?.end > winnings.find(win => win.player_team_id === k.player_team_id).current_rank,
                            points: match_stat.status.toLowerCase() == 'upcoming' ? 0 : winnings.find(win => win.player_team_id === k.player_team_id).player_points,
                            rank: match_stat.status.toLowerCase() == 'upcoming' ? 0 : winnings.find(win => win.player_team_id === k.player_team_id).current_rank,
                            cap_name: fetch_cap_name,
                            points: winnings.find(win => win.player_team_id === k.player_team_id).player_points,
                            vc_name: fetch_vc_name
                        })
                    }
                })?.filter(e => e),
                breakup_details: match_stat.status.toLowerCase() == 'upcoming' ? e.contest.upcoming_breakups : live_breakup.filter(j => j.contest_id === e.contest_id).map(o => (
                    {
                        name: o.name,
                        prize: o.prize,
                    }
                )),
                my_teams: total_contest?.filter(t => t.contest_id == e.contest_id)?.length,
                is_infinite: false,
                infinite_breakup: {
                    winner_percent: null,
                    winner_amount: null
                }
            }
        })

        const modify_contest = [... new Set(contest.map(e => e.contest_id))]
        const final_data = []
        for (let i = 0; i < modify_contest.length; i++) {
            final_data.push(contest[i])
        }
        console.log("join_contest", req.body);
        res.status(200).json({
            status: true,
            message: 'Data Found',
            data: { joined_contest: final_data }
        })

    } catch (error) {
        console.log(error)
        res.status(400).json({
            status: false,
            message: error.message
        })
    }
}

const joined_contest_details = async (req, res) => {
    try {

        const { match_id, contest_id } = req.body
        const token = await fetch_user(req.headers.authorization.split(" ")[1])
        const get_Fixture = await Fixtures.findOne({
            where: { id: match_id }
        })

        const live_breakup = await Live_breakup.findAll({
            where: {
                fixture_id: match_id,
                contest_id: contest_id
            },
            attributes: ['name', 'prize', 'start', 'end']
        })

        const contest_detail = await Contests.findOne({
            where: { 'id': contest_id },
            include: [{
                model: Join_contest,
                attributes: { exclude: ['id', 'group_id', 'contest_id', 'series_id', 'fixture_id', 'admin_comission', 'bonus_amount', 'total_amount', 'deposit_cash', 'wallet_type', 'status', 'position', 'createdAt', 'updatedAt'] },
                where: { 'fixture_id': match_id },
                include: [{
                    // where: {user_id : token.id},
                    model: CaptainViceCaptain,
                    attributes: ["id"],
                    include: [{
                        model: UserTeam,
                        attributes: ["team_count"]
                    }]
                }, {
                    model: Users,
                    attributes: ["user_team"]
                }]
            },
            {
                model: Upcoming_breakup,
                attributes: ["name", "start", "end", "prize"]
            }
            ]
        })

        const empty_team = await Contests.findOne({
            where: { 'id': contest_id },
            include: [
                {
                    model: Upcoming_breakup,
                    attributes: ["name", "start", "end", "prize"]
                }
            ]
        })

        const my_teams = contest_detail ? contest_detail.join_contests.filter(e => e.user_id === token.id).map(j => j.userteam_cap_vice.id) : []
        const modify_data = {
            match_status: get_Fixture.status,
            prize_money: contest_detail ? contest_detail.winning_amount : empty_team.winning_amount,
            confirm_winning: contest_detail ? contest_detail.confirmed_winning : empty_team.confirmed_winning,
            total_teams: get_Fixture.status === "live" ? contest_detail ? (contest_detail.join_contests.length) : empty_team.contest_size : contest_detail ? contest_detail.contest_size : empty_team.contest_size,
            entry_fee: contest_detail ? contest_detail.entry_fee : empty_team.entry_fee,
            invite_code: contest_detail ? contest_detail.invite_code : empty_team.invite_code,
            join_multiple_teams: contest_detail ? contest_detail.multiple_team : empty_team.multiple_team,
            total_winners: contest_detail ? contest_detail.upcoming_breakups[contest_detail.upcoming_breakups?.length - 1]?.end : empty_team.upcoming_breakups[empty_team.upcoming_breakups?.length - 1]?.end,
            teams_joined: contest_detail ? contest_detail.join_contests.length : 0,
            is_joined: true,
            my_teams,
            is_infinite: false,
            infinite_breakup: {
                winner_percent: null,
                winner_amount: null
            },
            joined_team_list: contest_detail ? contest_detail.join_contests.map(e => {
                return ({
                    user_id: e.user_id,
                    user_image: e.user?.image ? e.user?.image : "",
                    team_name: e.user?.user_team,
                    team_id: e.player_team_id,
                    team_count: e.userteam_cap_vice.userteams[0].team_count,
                    rank: e.current_rank,
                    previous_rank: e.previous_rank,
                    point: e.player_points,
                    winning_amount: get_Fixture.status == "completed" ? e.winning_amount : 0.0,
                    in_winning_zone: get_Fixture.status.toLowerCase() == 'upcoming' ? false : contest_detail.upcoming_breakups[contest_detail.upcoming_breakups.length - 1].end > e.current_rank,
                    is_yours: (e.user_id === token.id ? 1 : 0)
                })
            }) : [],
            breakup_details: get_Fixture.status.toLowerCase() == "upcoming" ? contest_detail ? contest_detail.upcoming_breakups : empty_team.upcoming_breakups : live_breakup,
            review_status: "",
        }

        await res.status(200).json({ status: true, message: 'Data Found', data: modify_data })
    }
    catch (error) {
        console.log(error)
        res.status(400).json({ status: false, message: error.message })
    }
}

const joined_contest_detail = async (req, res) => {
    try {
        const { match_id, contest_id } = req.body
        const token = await fetch_user(req.headers.authorization.split(" ")[1])

        if (!match_id || !contest_id) {
            return res.status(400).json({ status: false, message: "Missing Fields" })
        }

        const contest_detail = await Contests.findOne({
            where: { 'id': contest_id },
            include: [{
                model: Join_contest,
                attributes: { exclude: ['id', 'group_id', 'contest_id', 'series_id', 'fixture_id', 'admin_comission', 'bonus_amount', 'total_amount', 'deposit_cash', 'wallet_type', 'status', 'position', 'createdAt', 'updatedAt'] },
                where: { 'fixture_id': match_id },
                include: [{
                    model: CaptainViceCaptain,
                    attributes: ["id"],
                }]
            }, {
                model: Upcoming_breakup,
                attributes: ["name", "start", "end", "prize"]
            }]
        })

        const empty_team = await Contests.findOne({
            where: { 'id': contest_id },
            include: [
                {
                    model: Upcoming_breakup,
                    attributes: ["name", "start", "end", "prize"]
                }
            ]
        })

        const get_Fixture = await Fixtures.findOne({
            where: { id: match_id }
        })

        const my_teams = contest_detail ? contest_detail.join_contests.filter(e => e.user_id === token.id).map(j => j.userteam_cap_vice.id) : []
        const modified_data = {
            match_status: get_Fixture.status,
            prize_money: contest_detail ? contest_detail.winning_amount : empty_team.winning_amount,
            confirm_winning: contest_detail ? contest_detail.confirmed_winning : empty_team.confirmed_winning,
            total_teams: get_Fixture.status === "live" ? contest_detail ? (contest_detail.join_contests.length) : empty_team.contest_size : contest_detail ? contest_detail.contest_size : empty_team.contest_size,
            entry_fee: contest_detail ? contest_detail.entry_fee : empty_team.entry_fee,
            invite_code: contest_detail ? contest_detail.invite_code : empty_team.invite_code,
            join_multiple_teams: contest_detail ? contest_detail.multiple_team : empty_team.multiple_team,
            total_winners: contest_detail ? contest_detail.upcoming_breakups[contest_detail.upcoming_breakups?.length - 1]?.end : empty_team.upcoming_breakups[empty_team.upcoming_breakups?.length - 1]?.end,
            teams_joined: contest_detail ? contest_detail.join_contests.length : 0,
            is_joined: true,
            my_teams,
            is_infinite: false,
            infinite_breakup: {
                winner_percent: null,
                winner_amount: null
            },
        }

        await res.status(200).json({ status: true, message: 'Joined Contest Data', data: modified_data })
    }
    catch (error) {
        res.status(400).json({ status: false, message: error.message })
    }
}

const leader_board = async (req, res) => {
    try {

        const { page } = req.query
        const { match_id, contest_id } = await req.body
        const token = await fetch_user(req.headers.authorization.split(" ")[1])
        const limit = 40
        const offset = ((page || 1) - 1) * limit

        if (!match_id || !contest_id) {
            return res.status(400).json({ status: false, message: "Missing Fields" })
        }

        const contest_detail = await Join_contest.findAll({
            where: { fixture_id: match_id, contest_id: contest_id },
            limit,
            offset,
            attributes: ["player_team_id", "player_points", "previous_rank", "current_rank", "user_id", "fixture_id", "winning_amount"],
            include: [{
                model: Fixtures,
                attributes: ['status']
            }, {
                model: CaptainViceCaptain,
                attributes: ["id"],
                include: [{
                    model: UserTeam,
                    attributes: ["team_count"]
                }, {
                    model: Users,
                    attributes: ["user_team"]
                }]
            }],
            order: [
                [sequelize.literal(`(join_contest.user_id = ${token.id})`), 'DESC'],
                ['current_rank', 'ASC'],
            ],
        });

        const count = await Join_contest.count({ where: { fixture_id: match_id, contest_id: contest_id } })

        const contest = await Contests.findOne({
            where: { 'id': contest_id },
            include: [
                {
                    model: Upcoming_breakup,
                    attributes: ["name", "start", "end", "prize"]
                }
            ]
        })

        const result = []

        for (let e of contest_detail) {
            let data = {}
            data.user_id = e.user_id
            data.team_name = e.userteam_cap_vice.user.user_team,
                data.team_count = e.userteam_cap_vice.userteams[0].team_count
            data.team_id = e.player_team_id
            data.point = e.player_points
            data.previous_rank = e.previous_rank
            data.rank = e.current_rank
            data.is_yours = (e.user_id == token.id) ? 1 : 0
            data.winning_amount = (e.fixture.status == 'completed') ? e.winning_amount : 0.0,
                data.in_winning_zone = (e.fixture.status == 'upcoming') ? false : contest.upcoming_breakups[contest.upcoming_breakups.length - 1].end > e.current_rank,
                result.push(data)
        }

        const total_pages = Math.ceil(count / limit)
        const current_page = await page || 1

        await res.status(200).json({ status: true, message: "Data Found", data: { data: result/* contest_detail?.rows */, total_pages, current_page } })
    }
    catch (error) {
        console.log(error)
        await res.status(400).json({ status: false, message: error.message })
    }
}

const Joined_contest_match = async (req, res) => {
    try {
        const token = await fetch_user(req.headers.authorization.split(" ")[1])
        const match_status = req.query.status === '1' ? 'upcoming' : req.query.status === '2' ? 'live' : 'completed'
        const page = req.query.page ? req.query.page : 1
        const limit = 10
        const paginate = pagination(page, limit)
        // const totalPages = Math.ceil(await Contests.count({ where: { status: 1 } }) / limit)
        const total_contest = await Join_contest.findAll({
            where: {
                user_id: token.id
            },
            order: [
                ['createdAt', 'ASC']
            ],
            include: [{
                model: Fixtures,
                where: {
                    status: match_status
                }
            }]
        })

        const modify_fixtures_list = total_contest.map(e => e.fixture)

        const unique = [... new Set(modify_fixtures_list.map(x => x.id))]

        const totalPages = Math.ceil(unique.length / limit)

        const fetch_match = await Join_contest.findAll({
            group: 'fixture_id',
            attributes: ['fixture_id'],
            where: {
                user_id: token.id
            },
            offset: paginate.offset,
            limit: paginate.limit,
            include: [{
                model: Fixtures,
                where: {
                    status: match_status
                }
            }],
        })

        const teams_contest = await Join_contest.findAll({
            where: {
                user_id: token.id
            },
            include: [{
                model: Fixtures,
                attributes: ['id'],
                include: [{
                    model: CaptainViceCaptain,
                    where: { user_id: token.id }
                }]
            }]
        })

        const modify_data = fetch_match.map(e => {
            const contest_count = teams_contest.filter(j => j.fixture_id === e.fixture.id)
            const unique = [... new Set(contest_count.map(x => x.contest_id))]?.length
            const modified_date = moment(e.fixture.match_date).utc().toISOString();
            return ({
                sports_id: e.fixture.sports_id,
                c_id: e.fixture.c_id,
                series_id: e.fixture.series_id,
                match_title: e.fixture.match_title,
                id: e.fixture.id,
                is_playing: e.fixture.is_playing,
                team_a_id: e.fixture.team_a_id,
                team_a: e.fixture.team_a,
                team_a_flag: e.fixture.team_a_flag,
                team_a_short: e.fixture.team_a_short,
                team_b_id: e.fixture.team_b_id,
                team_b: e.fixture.team_b,
                team_b_flag: e.fixture.team_b_flag,
                team_b_short: e.fixture.team_b_short,
                match_date: modified_date,
                lineup_out: e.fixture.lineup_out,
                total_contest: unique,
                total_teams: teams_contest.filter(k => k.fixture_id === e.fixture_id).length, //teams_contest.find(j => j.fixture_id === e.fixture.id).fixture.userteam_cap_vices?.length,
                max_teams: 20
            })
        })


        const sorted_data = {
            data: modify_data.sort((a, b) => a.match_date - b.match_date).reverse(),
            totalPages,
            currentPage: page
        }

        res.status(200).json({
            status: true,
            message: "matches data found",
            data: sorted_data
        })
    } catch (error) {
        res.status(400).json({
            status: false,
            message: error.message
        })
    }
}

const my_matches = async (req, res) => {
    try {
        const token = await fetch_user(req.headers.authorization.split(" ")[1])
        // const startTime = new Date()
        // const endTime = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000)
        // Get current date and time
        const now = new Date();
        const startTime = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 9, 0, 0);
        const endTime = new Date(startTime.getTime() + 3 * 24 * 60 * 60 * 1000);

        const fixtures = await Join_contest.findAll({
            where: {
                user_id: token.id
            },
            include: [
                {
                    model: CaptainViceCaptain
                },
                {
                    model: Fixtures,
                    attributes: { exclude: ["is_status", "active", "is_playing"] },
                    where: {
                        [Op.or]: [
                            { status: 'upcoming' },
                            { status: 'live' },
                            { match_date: { [Op.lt]: startTime, [Op.gt]: endTime } }
                        ]
                    },
                    attributes: { exclude: ['createdAt', 'updatedAt', 'm_id'] },
                }]
        })

        const unique = [... new Set(fixtures.map(x => x.fixture_id))]

        const unique_fixture = unique.map(e => {
            return (fixtures.find(j => j.fixture_id === e))
        })

        const modify_data = unique_fixture.map((e, t) => {
            const fixtureData = e.fixture.dataValues;
            // Convert match_date to India time in the desired format
            fixtureData.match_date = moment(fixtureData.match_date).utc().toISOString();
            const unique_fixture = fixtures.filter(j => j.fixture_id === e.fixture_id).map(t => t.player_team_id)
            const unique_teams = [... new Set(unique_fixture.map(x => x))].length
            const fixture = unique_fixture.filter(j => j.fixture_id === e.fixture.id)
            const unique_contest = [... new Set(unique_fixture.map(x => x.contest_id))].length
            const is_status = e.fixture.dataValues.status.toLowerCase() == 'live' ? 1 : e.fixture.dataValues.status.toLowerCase() == 'upcoming' ? 2 : 3
            // const unique_teams = [... new Set(fixtures.map(x => x.player_team_id))].length
            return ({
                total_teams: unique_teams,
                is_status,
                total_contest: unique_contest,
                ...e.fixture.dataValues,
                max_teams: 20
            })
        })

        const sorted = modify_data.sort((a, b) => a.is_status - b.is_status)
        res.status(200).json({
            status: true,
            message: 'matches data found',
            data: sorted
        })

    } catch (error) {
        res.status(400).json({
            status: false,
            message: error.message
        })
    }
}

const contest_filter = async (req, res) => {
    try {
        const token = await fetch_user(req.headers.authorization.split(" ")[1])
        const modify_data = {
            // entry_fee: [                
            //     {'1 to 100' : [1, 100]},
            //     {'101 to 1000' : [101, 1001]},
            //     {'1001 to 5000' : [1001, 5000]},
            //     {'5000 & more' : [5000]}
            // ],
            entry_fee: ['1 to 100', '101 to 1000', '1001 to 5000', '5000 & more'],
            winnings: ['1 to 10000', '10,001 to 50,000', '50,0001 to 1 Lakh', '1 Lakh to 10 Lakh', '10 Lakh to 25 Lakh', '25 Lakh & more'],
            contest_type: ['Multi Entry', 'Multi Winner', 'Confirmed'],
            contest_size: ['2 Member', '3 to 10', '11 to 20', '21 to 100', '101 to 1,000', '1,001 to 10,000', '10,001 to 50,000', '50,001 & more']
        }
        res.status(200).json({
            status: true,
            message: "contest type data found",
            data: modify_data
        })
    } catch (error) {
        res.status(400).json({
            status: false,
            message: error.message,
            data: []
        })
    }
}

const group_filling = async (match_id, contest_id) => {
    try {
        const total_contest = await Join_contest.findAndCountAll({
            where: [
                /* { 'fixture_id': match_id, },
                { 'contest_id': { [Op.in]: contest_id } }, */
                { 'group_id': null },
                { status: 1 }
            ]
        })
        const settings = await Setting.findAll({ raw: true })
        const total_group_count = settings[0].total_group_count
        if (total_contest.count >= total_group_count) {
            const remaining_contest = await total_contest.count - total_group_count
            var count = 0
            const initial_group = await Groups.findAll({ raw: true })

            if (!initial_group.length) {
                await Groups.create({
                    parent_g_id: 0,
                    level: 1,
                    left_leg: 0,
                    right_leg: 1,
                    status: 'Filling'
                })
            }

            const group_id = await Groups.findOne({ where: { 'status': 'Filling' } })

            const first_hundred_contest = total_contest.rows.slice(0, total_group_count)
            for (let e of first_hundred_contest) {
                await Join_contest.update({ group_id: group_id.id }, { where: { 'id': e.id } })
                count++
            }

            if (count == total_group_count) {
                await level_income_details()
            }
            if (remaining_contest) {
                await group_filling(match_id, contest_id)
            } else {
                /* console.log('completed')
                await level_income_details()
                const complete_group = await Groups.findAll({ where: { status: 'completed' }, attributes: ["id"] })
                for (let e of complete_group) {
                    console.log(e.id)
                    let completed_group_id = e.id
                    await sequelize.query(`CALL referral_procedure(:completed_group_id)`, { replacements: { completed_group_id } })
                } */
            }
        }
    }
    catch (error) {
        console.log(error.message)
    }
}

const level_filling_update = async () => {
    try {
        console.log('completed')
        await level_income_details()
        const complete_group = await Groups.findAll({ where: { status: 'completed' }, attributes: ["id"] })
        for (let e of complete_group) {
            console.log(e.id)
            let completed_group_id = await e.id
            await sequelize.query(`CALL referral_procedure(:completed_group_id)`, { replacements: { completed_group_id } })
        }
    }
    catch (error) {
        console.log(error)
    }
}

const user_cash_back = async (fixture_id) => {
    try {
        const total_contest = await Join_contest.findAll({
            where: { fixture_id: fixture_id },
            attributes: [
                [Sequelize.fn('DISTINCT', Sequelize.col('user_id')), 'user_id'],
            ]
        })

        const referral_income = []
        for (let e of total_contest) {
            const data = await Wallet_transaction.sum('credit_amount', { where: { 'user_id': e.user_id, 'transaction_type': 'Referral Income' } })
            referral_income.push({ user_id: e.user_id, amount: data })
        }
        for (let i of referral_income) {
            await Users.update({ cashback: (i.amount ? i.amount : 0) }, { where: { id: i.user_id } })
        }

        const level_income = []
        for (let j of total_contest) {
            const data = await Wallet_transaction.sum('credit_amount', { where: { 'user_id': j.user_id, 'transaction_type': 'Group Level Income' } })
            level_income.push({ user_id: j.user_id, amount: data })
        }
        for (let k of level_income) {
            await Users.update({level_income:(k.amount ? k.amount : 0 )},{where:{id:k.user_id}})
        }     

    }
    catch (error) {
        console.log(error)
    }
}

const level_income_details = async (req, res) => {
    try {
        const settings = await Setting.findAll({ raw: true })
        const total_group_count = await settings[0].total_group_count

        const group = await Groups.findAndCountAll({
            where: { 'status': 'Filling' },
            include: [{
                model: Join_contest
            }],
            raw: true
        })

        var parent_id
        var parent
        var parent_value
        var completed_group_id
        if (group.count === total_group_count) {
            parent_id = await group.rows[0].id
            parent = await parent_id + 1
            if (parent % 2 == 0) {
                parent_value = await parent / 2
            }
            else {
                parent_value = (parent - 1) / 2
            }
            const parent_group = await Groups.findOne({ where: { 'id': parent_value }, raw: true })

            const entity_id = parent_id + 1
            const entity_parent_g_id = parent_value
            const entity_level = parent_group.level + 1
            const entity_left_leg = parent_group.right_leg
            const entity_right_leg = parent_group.right_leg + 1
            const entity_status = 'Filling'

            await Groups.create({
                parent_g_id: entity_parent_g_id,
                level: entity_level,
                left_leg: entity_left_leg,
                right_leg: entity_right_leg,
                status: entity_status,
                incomelevel: 0
            })

            const test2 = await Groups.update({ 'right_leg': parent_group.right_leg + 2 }, { where: { 'id': parent_value } })

            await Groups.update({ 'status': 'Completed' }, { where: { 'id': group.rows[0].id } })

            completed_group_id = await group.rows[0].id

            const test = await Groups.update(
                { left_leg: sequelize.literal('left_leg + 2') },
                {
                    where: [
                        { left_leg: { [Op.gte]: entity_left_leg } },
                        { id: { [Op.ne]: entity_parent_g_id } },
                        { id: { [Op.ne]: entity_id } }
                    ]
                }
            );

            const test1 = await Groups.update(
                { right_leg: sequelize.literal('right_leg + 2') },
                {
                    where: [
                        { right_leg: { [Op.gte]: entity_right_leg } },
                        { id: { [Op.ne]: entity_parent_g_id } },
                        { id: { [Op.ne]: entity_id } }
                    ]
                }
            );

            for (i = 1; i <= 12; i++) {
                await processGroupLevelIncome(completed_group_id, i)
            }
            // await sequelize.query(`CALL referral_procedure(:completed_group_id)`, { replacements: { completed_group_id } })
        }
        // await res.status(200).json({ status: true, message: 'Data Found', data: group })
    }
    catch (error) {
        console.log(error.message)
        // res.status(400).json({ status: false, message: error.message })
    }
}

const processGroupLevelIncome = async (id, level) => {
    try {
        const completed_group = await Groups.findAll({ where: { 'status': 'Completed', 'id': id }, raw: true })
        const setting = await Setting.findAll({ raw: true })
        const { level_first, level_second, level_third, level_four, level_five, level_six, level_seven, level_eight, level_nine, level_ten, level_eleven, level_twelve } = await setting[0]
        var levelIncome
        if (level === 1) {
            levelIncome = level_first
        } else if (level === 2) {
            levelIncome = level_second
        } else if (level === 3) {
            levelIncome = level_third
        } else if (level === 4) {
            levelIncome = level_four
        } else if (level === 5) {
            levelIncome = level_five
        } else if (level === 6) {
            levelIncome = level_six
        } else if (level === 7) {
            levelIncome = level_seven
        } else if (level === 8) {
            levelIncome = level_eight
        } else if (level === 9) {
            levelIncome = level_nine
        } else if (level === 10) {
            levelIncome = level_ten
        } else if (level === 11) {
            levelIncome = level_eleven
        } else {
            levelIncome = level_twelve
        }

        var left_leg = await completed_group[0].left_leg
        var right_leg = await completed_group[0].right_leg
        var complete_level = await completed_group[0].level

        const result = await sequelize.query(`CALL level_procedure(:left_leg, :complete_level, :level)`, { replacements: { left_leg, complete_level, level } })

        if (result.length) {
            const g_id = result[0].id

            const joined_contest_group = await Join_contest.findAll({ where: { 'group_id': g_id }, raw: true })
            await joined_contest_group.map(async contest => {
                await Wallet_transaction.create({
                    user_id: contest.user_id,
                    transaction_type: 'Group Level Income',
                    join_contest_details_id: contest.id,
                    debit_amount: 0,
                    credit_amount: levelIncome,
                    group_id: contest.group_id,
                    team_id: 0,
                    level: level,
                    referral_income_level: 0,
                    wallet_transaction_id: 0,
                    referra_income_from: 0
                })

            })
            await Groups.update({ 'incomelevel': level }, { where: { id: g_id } })
        }
    }
    catch (error) {
        console.log(error.message)
    }
}

module.exports = {
    contest,
    Total_contest,
    join_contest,
    verify_wallet_amount,
    joined_contest,
    joined_contest_details,
    joined_contest_detail,
    Joined_contest_match,
    my_matches,
    contest_filter,
    group_filling,
    level_income_details,
    leader_board,
    level_filling_update,
    user_cash_back
}

