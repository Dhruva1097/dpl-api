const {CronJob} = require('cron')
const { CronTime } = require('cron-time-generator')
const { update_team_points, getPerformanceSquad,getLineUpSquads, getLiveScoreSportsData, getLiveScore, getSeriesSportsData, getFixturesSportsData, getSquadSportsData, getTeamsSportsData, } = require('../services')

const series = new CronJob(
    "0 0 1 * *",
    async () => {
        // getSeriesSportsData()
    },
    null,
    true
)

const fixtures = new CronJob(
    "0 0 1 * *",
    async () => {
        // getFixturesSportsData()
    },
    null,
    true
)

const teams = new CronJob(
    "0 0 1 * *",
    async () => {
        // getTeamsSportsData()
    },
    null,
    true
)

const squads = new CronJob(
    "0 0 1 * *",
    async () => {
        // getSquadSportsData()
    },
    null,
    true
)

const lineup = new CronJob(
    "*/60 * * * * *",
    async () => {
        await getLineUpSquads()
        await getPerformanceSquad()
    },
    null,
    true
)

const livescore = new CronJob(
    "*/60 * * * * *",
    async () => {
        getLiveScoreSportsData()
    },
    null,
    true
)

const update_points = new CronJob(
    "*/300 * * * * *",
    async () => {
        update_team_points()
    },
    null,
    true
)

const score_card = new CronJob(
    "*/300 * * * * *",
    async () => {
        getLiveScore()
    },
    null,
    true
)

module.exports = {
    series,
    fixtures,
    squads,
    lineup,
    livescore,
    update_points,
    score_card,
}