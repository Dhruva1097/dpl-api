const { Fixtures, Lineup, Match_contest, Contests, Contest_category } = require('../models')
const { Op } = require('sequelize')
const moment = require("moment-timezone");

const getFixtures = async (req, res) => {
    try {
        const { page } = req.query
        const start_time = Date.now()
        const limit = 10
        const offset = ((page || 1) - 1) * limit
        const currentPage = await page || 1
        const totalPages = Math.ceil(await Fixtures.count({ 
            where: { 
                /* match_date: start_time, */
                status:'upcoming',
                active: 1 
            } 
        }) / limit)
        const lineup = await Lineup.findAll()
        const fixtures = await Fixtures.findAll({ 
            attributes: { exclude: ['result_flag', 'active', 'is_playing', 'createdAt', 'updatedAt'] }, 
            limit, 
            offset, 
            order: [['match_date', 'ASC']],
            where: { 
                /* match_date: start_time, */
                status: 'upcoming', 
                active: 1 }, 
                raw: true 
            })

        // console.log(fixtures)
        for (let e of fixtures) {
            e.match_date = moment(e.match_date).utc().toISOString();
            const match_contest = await Match_contest.findAndCountAll({
                include: [{
                    model: Contests,
                    include: [{
                        model: Contest_category
                    }]
                }],
                where: { 'fixture_id': e.id }
            })
            if (match_contest.count) {
                match_contest.rows.map(j => {
                    if (j.contest.winning_amount == Math.max(...match_contest.rows.map(i => i.contest.winning_amount))) {
                        // console.log(j.contest.contest_category)
                        e.match_contest = j.contest.contest_category.description + ' ₹' + j.contest.winning_amount
                    }
                })
            }
            else {
                e.match_contest = "Coming Soon"
            }
            e.is_playing = 0,
            e.lineup_out = await lineup.filter(k => k.m_id === e.id).length ? true : false
            e.total_contest = await match_contest.count,
            e.total_teams = 0,
            e.max_teams = 20
        }

        await res.status(200).json({
            status: true,
            message: "Data Found",
            data: {
                data: fixtures, currentPage, totalPages
            }
        })
    }
    catch (error) {
        console.log(error)
        res.status(400).json({ status: false, message: error.message })
    }
}

// Activate Fixtures
const activateFixtures = async (req, res) => {
    try {
        // const fixtureIds = []
        const { id } = req.body
        await Fixtures.update({ 'active': 1 }, { where: { 'm_id': { [Op.in]: [id] } } })
        await res.status(200).json({ status: true, message: "Fixture Activated Successfully" })
    }
    catch (error) {
        console.log(error)
        res.status(400).json({ status: false, message: error.message })
    }
}

module.exports = {
    getFixtures,
    activateFixtures
}