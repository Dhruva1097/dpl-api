const { getuserPlayerPoints, getuserPlayerPointsTest } = require('../controllers/userTeams')
const { Series, Fixtures, Teams, Squads, Performance, Lineup, Users, CaptainViceCaptain, UserTeam, Join_contest, PointSystem, Upcoming_breakup, Contests, Live_breakup, Transactions, Scorecard, Match_contest, Notifications, sequelize, Full_scorecard } = require('../models')
const { group_filling } = require('../controllers/contests')
const { Op } = require('sequelize')
const moment = require('moment')

// series
const getSeriesSportsData = async () => {
    const totalData = await fetch(`http://13.56.135.148:8080/api/v1/series?season=${2024}&status=3`).then((response) => { return response.json() })
    try {
        for (i = 1; i <= totalData.totalPage; i++) {
            const sportsData = await fetch(`http://13.56.135.148:8080/api/v1/series?season=${2024}&page=${i}&status=3`).then((response) => { return response.json() })
            const dbSeries = await Series.findAll()
            const exist = await JSON.parse(JSON.stringify(dbSeries)).map(data => data.c_id)
            const current = await sportsData.data

            current.map(async data => {
                if (!exist.includes(data.cid)) {
                    await Series.create({
                        c_id: data.cid,
                        series_name: data.title,
                        series_title: data.abbr,
                        match_type: data.match_format,
                        status: data.status,
                        start_date: data.date_start,
                        end_date: data.date_end,
                        active: 0
                    })
                } else {
                    await Series.update({
                        c_id: data.cid,
                        series_name: data.title,
                        series_title: data.abbr,
                        match_type: data.match_format,
                        status: data.status,
                        start_date: data.date_start,
                        end_date: data.date_end,
                        active: 0
                    }, { where: { 'c_id': data.cid } })
                    console.log("Series Already Exist")
                }
            })
        }
    }
    catch (error) {
        console.log(error.message)
    }

}

// fixture 
const getFixturesSportsData = async () => {
    try {
        const series_list = await Series.findAll()
        const fixture_list = await Fixtures.findAll()
        const exist = JSON.parse(JSON.stringify(fixture_list)).map(data => data.m_id)
        const series_id = series_list.map(series => series.c_id)
        if (series_id.length) {
            series_id.map(async (id) => {
                const series_foreign_id = series_list.filter(e => e.c_id === id)
                const fetch_page = await fetch(`http://13.56.135.148:8080/api/v1/fixture/${id}`).then(res => res.json())
                for (let i = 1; i <= fetch_page.totalPage; i++) {
                    const fixtures_data = await fetch(`http://13.56.135.148:8080/api/v1/fixture/${id}?page=${i}`)
                        .then(res => res.json())
                        .catch(err => console.log(err))
                    const fix_data = await fixtures_data?.data
                    if (fix_data?.length) {
                        fix_data.map(async fixture => {
                            if (!exist.includes(fixture.fixtureMatch.match_id)) {
                                await Fixtures.create({
                                    sports_id: 1,
                                    c_id: fixture.cid,
                                    series_id: series_foreign_id[0].id,
                                    m_id: fixture.fixtureMatch.match_id,
                                    match_title: fixture.title,
                                    match_type: fixture.fixtureMatch.format_str,
                                    match_date: fixture.fixtureMatch.date_start,
                                    team_a_id: fixture.fixtureMatch.teama.team_id,
                                    team_a: fixture.fixtureMatch.teama.name,
                                    team_a_short: fixture.fixtureMatch.teama.short_name,
                                    team_a_flag: fixture.fixtureMatch.teama.logo_url,
                                    team_b_id: fixture.fixtureMatch.teamb.team_id,
                                    team_b: fixture.fixtureMatch.teamb.name,
                                    team_b_short: fixture.fixtureMatch.teamb.short_name,
                                    team_b_flag: fixture.fixtureMatch.teamb.logo_url,
                                    status: fixture.fixtureMatch.status_str,
                                    active: 0,
                                    is_playing: 1,
                                    lineup_out: false,
                                    result_flag: fixture.fixtureMatch.winning_team_id === fixture.fixtureMatch.teama.team_id ? fixture.fixtureMatch.teama.logo_url : fixture.fixtureMatch.teamb.logo_url
                                })
                            } else {
                                await Fixtures.update({
                                    sports_id: 1,
                                    c_id: fixture.cid,
                                    series_id: series_foreign_id[0].id,
                                    m_id: fixture.fixtureMatch.match_id,
                                    match_title: fixture.title,
                                    match_type: fixture.fixtureMatch.format_str,
                                    match_date: fixture.fixtureMatch.date_start,
                                    team_a_id: fixture.fixtureMatch.teama.team_id,
                                    team_a: fixture.fixtureMatch.teama.name,
                                    team_a_short: fixture.fixtureMatch.teama.short_name,
                                    team_a_flag: fixture.fixtureMatch.teama.logo_url,
                                    team_b_id: fixture.fixtureMatch.teamb.team_id,
                                    team_b: fixture.fixtureMatch.teamb.name,
                                    team_b_short: fixture.fixtureMatch.teamb.short_name,
                                    team_b_flag: fixture.fixtureMatch.teamb.logo_url,
                                    status: fixture.fixtureMatch.status_str,
                                    active: 0,
                                    is_playing: 1,
                                    lineup_out: false,
                                    result_flag: fixture.fixtureMatch.winning_team_id === fixture.fixtureMatch.teama.team_id ? fixture.fixtureMatch.teama.logo_url : fixture.fixtureMatch.teamb.logo_url
                                }, { where: { 'm_id': fixture.fixtureMatch.match_id } })
                                console.log('Fixture Already Exist')
                            }
                        })
                    }
                }
            })

        } else {
            console.log('error');
        }
    } catch (error) {
        console.log(error.message);
    }

}

// teams
const getTeamsSportsData = async () => {
    try {
        const seriesData = await Series.findAll()
        const cidList = await JSON.parse(JSON.stringify(seriesData)).map(data => data.c_id)
        const dbTeams = await Teams.findAll()
        const exist = await JSON.parse(JSON.stringify(dbTeams)).map(data => data.team_id)
        await cidList.map(async cid => {
            const teamsData = await fetch(`http://13.56.135.148:8080/api/v1//team/${cid}`).then((response) => { return response.json() })
            const current = await teamsData.data
            if (current.length) {
                current.map(data => {
                    if (!exist.includes(data.tid)) {
                        Teams.create({
                            sports_id: 1,
                            team_id: data.tid,
                            team_name: data.title,
                            team_short_name: data.abbr,
                            team_flag: data.logo_url,
                            status: 1
                        })
                        exist.push(data.tid)
                    } else {
                        console.log('already exist')
                    }
                })
            } else console.log("Teams Not Found")
        })
    }
    catch (error) {
        console.log(error)
    }
}

// squads 
const getSquadSportsData = async () => {
    try {
        const fromDate = new Date()
        const toDate = new Date(Date.now() + 6 * 24 * 60 * 60 * 1000)
        const seriesData = await Series.findAll({
            where: {
                [Op.or]: [{
                    status: 'upcoming',
                    start_date: {
                        [Op.gte]: fromDate.toISOString()
                    }, start_date: {
                        [Op.lte]: toDate.toISOString()
                    }
                }, {
                    status: 'live',
                }],
            }
        })
        const cidList = await JSON.parse(JSON.stringify(seriesData)).map(data => data.c_id)
        cidList.map(async cid => {
            const dbSquads = await Squads.findAll({ where: { 'c_id': cid } })
            const exist = await JSON.parse(JSON.stringify(dbSquads)).map(data => data.player_id)
            const oldCid = [...new Set(JSON.parse(JSON.stringify(dbSquads)).map(data => data.c_id))]
            const series_foreign_id = seriesData.filter(e => e.c_id === cid)
            const squadsData = await fetch(`http://13.56.135.148:8080/api/v1/squad//${cid}`).then((response) => response.json())
            const current = await squadsData.data
            const newCid = [...new Set(current.map(data => data.cid))]
            await current.map(team => {
                team.players.map(async (player) => {
                    // console.log(oldCid.includes(team.cid) && !exist.includes(player.pid))
                    if (!oldCid.includes(team.cid)) {
                        await Squads.create({
                            c_id: team.cid,
                            series_id: series_foreign_id[0].id,
                            team_id: team.team_id,
                            team_name: team.title,
                            player_id: player.pid,
                            player_name: player.title,
                            player_short_name: player.short_name,
                            player_type: player.playing_role,
                            batting_style: player.batting_style,
                            bowling_style: player.bowling_style,
                            nationality: player.nationality,
                            player_credit: player.fantasy_player_rating,
                            type: '',
                            status: 1,
                            is_playing: 0
                        })
                    }
                    else if (oldCid.includes(team.cid) && !exist.includes(player.pid)) {
                        // console.log(player.title)
                        await Squads.create({
                            c_id: team.cid,
                            series_id: series_foreign_id[0].id,
                            team_id: team.team_id,
                            team_name: team.title,
                            player_id: player.pid,
                            player_name: player.title,
                            player_short_name: player.short_name,
                            player_type: player.playing_role,
                            batting_style: player.batting_style,
                            bowling_style: player.bowling_style,
                            nationality: player.nationality,
                            player_credit: player.fantasy_player_rating,
                            type: '',
                            status: 1,
                            is_playing: 0
                        })
                    }
                    else {
                        await Squads.update({
                            c_id: team.cid,
                            series_id: series_foreign_id[0].id,
                            team_id: team.team_id,
                            team_name: team.title,
                            player_id: player.pid,
                            player_name: player.title,
                            player_short_name: player.short_name,
                            player_type: player.playing_role,
                            batting_style: player.batting_style,
                            bowling_style: player.bowling_style,
                            nationality: player.nationality,
                            player_credit: player.fantasy_player_rating,
                            type: '',
                            status: 1,
                            is_playing: 0
                        }, { where: { 'player_id': player.pid, 'series_id': cid } })
                        console.log("Player Already Exist")
                    }
                })
            })
        })
    }
    catch (error) {
        console.log(error.message)
    }
}

//squad
const getzquadSportsData = async (req, res) => {
    try {
        const fromDate = new Date()
        const toDate = new Date(Date.now() + 6 * 24 * 60 * 60 * 1000)
        const fixtureData = await Fixtures.findAll({
            where: {
                match_date: {
                    // [Op.gte]: moment().add(1, 'days').date()
                    [Op.gt]: new Date(Date.now() + 0 * 24 * 60 * 60 * 1000),
                    [Op.lt]: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000)
                }
            }
        })
        const matchList = fixtureData.map(data => data.m_id)
        matchList.map(async mid => {
            const dbSquads = await Squads.findAll({ where: { 'c_id': cid } })
        })


        cidList.map(async cid => {
            const dbSquads = await Squads.findAll({ where: { 'c_id': cid } })
            const exist = await JSON.parse(JSON.stringify(dbSquads)).map(data => data.player_id)
            const oldCid = [...new Set(JSON.parse(JSON.stringify(dbSquads)).map(data => data.c_id))]
            const series_foreign_id = seriesData.filter(e => e.c_id === cid)
            const squadsData = await fetch(`http://13.56.135.148:8080/api/v1/squad//${cid}`).then((response) => response.json())
            const current = await squadsData.data
            const newCid = [...new Set(current.map(data => data.cid))]
            // await current.map(team => {
            //     team.players.map(async (player) => {
            //         console.log(oldCid.includes(team.cid) && !exist.includes(player.pid))
            //         if (!oldCid.includes(team.cid)) {
            //             await Squads.create({
            //                 c_id: team.cid,
            //                 series_id: series_foreign_id[0].id,
            //                 team_id: team.team_id,
            //                 team_name: team.title,
            //                 player_id: player.pid,
            //                 player_name: player.title,
            //                 player_short_name: player.short_name,
            //                 player_type: player.playing_role,
            //                 batting_style: player.batting_style,
            //                 bowling_style: player.bowling_style,
            //                 nationality: player.nationality,
            //                 player_credit: player.fantasy_player_rating,
            //                 type: '',
            //                 status: 1,
            //                 is_playing: 0
            //             })
            //         }
            //         else if (oldCid.includes(team.cid) && !exist.includes(player.pid)) {
            //             console.log(player.title)
            //             await Squads.create({
            //                 c_id: team.cid,
            //                 series_id: series_foreign_id[0].id,
            //                 team_id: team.team_id,
            //                 team_name: team.title,
            //                 player_id: player.pid,
            //                 player_name: player.title,
            //                 player_short_name: player.short_name,
            //                 player_type: player.playing_role,
            //                 batting_style: player.batting_style,
            //                 bowling_style: player.bowling_style,
            //                 nationality: player.nationality,
            //                 player_credit: player.fantasy_player_rating,
            //                 type: '',
            //                 status: 1,
            //                 is_playing: 0
            //             })
            //         }
            //         else {
            //             await Squads.update({
            //                 c_id: team.cid,
            //                 series_id: series_foreign_id[0].id,
            //                 team_id: team.team_id,
            //                 team_name: team.title,
            //                 player_id: player.pid,
            //                 player_name: player.title,
            //                 player_short_name: player.short_name,
            //                 player_type: player.playing_role,
            //                 batting_style: player.batting_style,
            //                 bowling_style: player.bowling_style,
            //                 nationality: player.nationality,
            //                 player_credit: player.fantasy_player_rating,
            //                 type: '',
            //                 status: 1,
            //                 is_playing: 0
            //             }, { where: { 'player_id': player.pid, 'series_id': cid } })
            //             console.log("Player Already Exist")
            //         }
            //     })
            // })
        })
        res.status(200).json({
            data: matchList
        })
    }
    catch (error) {
        console.log(error.message)
        res.status(400).json({
            data: error.message
        })
    }
}

//lineup 
const getPerformanceSquad = async () => {
    try {
        const startTime = new Date()
        const endTime = new Date(Date.now() + 1 * 1 * 60 * 60 * 1000)
        const fixtures = await Fixtures.findAll({ where: { 'status': 'upcoming', match_date: { [Op.gt]: startTime, [Op.lt]: endTime } }, raw: true })
        const matchIdList = await fixtures.map(data => data.m_id)
        const lineup = await Performance.findAll({ raw: true })
        const lineupIdList = [...new Set(lineup.map(data => data.m_id))]
        const squads = await Squads.findAll({ raw: true })
        // console.log(lineupIdList)
        // console.log(matchIdList)
        fixtures.map(async match => {
            // console.log(match)
            const lineupSquads = await fetch(`http://13.56.135.148:8080/api/v1/scorecard/${match.m_id}/lineup`).then(response => response.json())
            const teamsKeys = Object.keys(lineupSquads).length ? Object.keys(lineupSquads.data.teams) : []
            teamsKeys.map(async key => {
                if (!lineupIdList.includes(match.id)) {
                    // console.log(lineupSquads.data.teams[key].tid)
                    lineupSquads.data.teams[key].squads.map(async player => {
                        const squads_foreign_id = squads.filter(e => ((e.player_id == player.player_id) && (e.series_id === match.series_id)))
                        // console.log(squads_foreign_id)
                        await Performance.create({
                            m_id: match.id,
                            team_type: key,
                            team_id: lineupSquads.data.teams[key].tid,
                            team_name: lineupSquads.data.teams[key].title,
                            player_id: player.player_id,
                            p_id: squads_foreign_id[0]?.p_id,
                            player_name: player.name,
                            player_type: player.role,
                            is_playing: 1
                        })
                    })
                }
                else {
                    console.log('already exist')
                }
            })
        })
    }
    catch (error) {
        console.log(error.message)
    }
}

const getLineUpSquads = async () => {
    try {
        const startTime = new Date()
        const endTime = new Date(Date.now() + 1 * 1 * 60 * 60 * 1000)
        const fixtures = await Fixtures.findAll({ where: { 'status': 'upcoming', match_date: { [Op.gt]: startTime, [Op.lt]: endTime } }, raw: true })
        const matchIdList = await fixtures.map(data => data.m_id)
        const m_id = await fixtures.map(data => data.id)
        const lineup = await Lineup.findAll({ raw: true })
        const lineupIdList = [...new Set(lineup.map(data => data.m_id))]
        // console.log(lineupIdList)
        if (fixtures.length) {
            await getSquadSportsData()
        }
        const squads = await Squads.findAll({ raw: true })
        // console.log(matchIdList)
        console.log(fixtures,startTime, endTime, 'dasda');
        await fixtures.map(async match => {
            const line_data = await Lineup.findAll({ where: { m_id: match.id }, raw: true })
            console.log(match.m_id, 'iddddddd')
            const scoreCard = await Scorecard.findAll({ where: { match_id: match.id }, raw: true })
            const lineupSquads = await fetch(`http://13.56.135.148:8080/api/v1/scorecard/${match.m_id}/lineup`).then(response => response.json()) //http://13.56.135.148:8080/api/v1/scorecard/${match.m_id}/lineup
            console.log(lineupSquads, 'line');
            const teamsKeys = lineupSquads.data ? Object.keys(lineupSquads.data.teams) : []
            teamsKeys.map(async key => {
                if (!lineupIdList.includes(match.id)) {
                    // console.log(lineupSquads.data.teams[key].tid)
                    lineupSquads.data.teams[key].squads.map(async player => {
                        const squads_foreign_id = await squads.filter(e => ((e.player_id == player.player_id) && (e.series_id === match.series_id)))
                        // console.log(match.series_id)
                        // console.log(squads_foreign_id[0]
                        await Lineup.create({
                            m_id: match.id,
                            team_type: key,
                            team_id: lineupSquads.data.teams[key].tid,
                            team_name: lineupSquads.data.teams[key].title,
                            player_id: squads_foreign_id[0]?.p_id,
                            player_name: player.name,
                            player_type: player.role,
                            is_playing: 1
                        })
                    })
                }
                else {
                    if (scoreCard.length < 2) {
                        await Scorecard.create({
                            match_id: match.id,
                            team_id: lineupSquads.data.teams[key].tid
                        })
                    } else {
                        console.log('Lineup Already Exist')
                    }
                }
            })
        })
    }
    catch (error) {
        console.log(error.message)
    }
}

const getLiveScoreSportsData = async () => {
    try {
        const startTime = new Date(Date.now() - 1 * 1 * 1 * 60 * 1000)
        const liveTimeStart = new Date(Date.now() + 1 * 1 * 1 * 60 * 1000)
        const liveTimeEnd = new Date(Date.now() - 1 * 1 * 5 * 60 * 1000)
        const endTime = new Date(Date.now() + 1 * 1 * 60 * 60 * 1000)
        const fixtures = await Fixtures.findAll({ where: { 'status': 'upcoming', match_date: { [Op.gte]: startTime, [Op.lte]: endTime } }, raw: true })
        fixtures.map(async match => {
            // console.log(liveTimeEnd, match.match_date, liveTimeStart)
            if (match.match_date < new Date(Date.now())) {
                console.log('running')
                await Fixtures.update({ status: 'live' }, { where: { 'm_id': match.m_id } })
            }
        })
        const liveMatch = await Fixtures.findAll({ where: { status: 'live', active: 1 }, raw: true })
        liveMatch.map(async match => {
            // console.log(match.m_id);
            const score = await fetch(`http://13.56.135.148:8080/api/v1/scorecard/${match.m_id}`).then(response => response.json())
            // console.log(score, 'match');
            const lineup = await Lineup.findAll({ where: { 'm_id': match.id }, raw: true })
            // if (score.data?.fixtureStatus?.toLowerCase() == 'completed') {
            //     await Fixtures.update({ status: 'completed' }, { where: { 'm_id': match.m_id } })
            // }
            const teamKeys = score?.data?.teams ? Object.keys(score?.data?.teams) : {}
            const teamIds = teamKeys.map(id => score.data.teams[id].teamAPIId)
            const innings = await score.data.innings
            const innings_one = innings.length > 2 ? innings.slice(0, 2) : []
            const innings_two = innings.length > 2 ? innings.slice(2, innings.length) : []
            const batting = await innings.map(data => data.bat)
            const batting_one = await innings_one.map(data => data.bat)
            const batting_two = await innings_two.map(data => data.bat)
            const bowling = await innings.map(data => data.bowl)
            const bowling_one = await innings_one.map(data => data.bowl)
            const bowling_two = await innings_two.map(data => data.bowl)
            const fielding = await innings.map(data => data.field)
            const fielding_one = await innings_one.map(data => data.field)
            const fielding_two = await innings_two.map(data => data.field)

            // Cricket
            if (innings_one.length && innings_two.length) {
                await batting_one.map(data => data.team.map(async data => {
                    const { playerAPIId, ballsFaced, runsScored, foursHit, sixesHit, strikeRate, outStatus, outType } = data

                    await Performance.update({ 'balls_faced': ballsFaced, 'run_scored': runsScored, 'fours_hit': foursHit, 'sixes_hit': sixesHit, 'batting_strikerate': strikeRate, 'out_status': outStatus, out_comment: outType.outComment }, { where: { player_id: playerAPIId, m_id: match.id }, raw: true })
                }))
                await batting_two.map(data => data.team.map(async data => {
                    const { playerAPIId, ballsFaced, runsScored, foursHit, sixesHit, strikeRate, outStatus, outType } = data

                    await Performance.update({ 'test_balls_faced': ballsFaced, 'test_run_scored': runsScored, 'test_fours_hit': foursHit, 'test_sixes_hit': sixesHit, 'test_batting_strikerate': strikeRate, 'test_out_status': outStatus, out_comment: outType.outComment }, { where: { player_id: playerAPIId, m_id: match.id }, raw: true })
                }))
            }
            else { // Other then TEST
                await batting.map(data => data.team.map(async data => {
                    const { playerAPIId, ballsFaced, runsScored, foursHit, sixesHit, strikeRate, outStatus, outType } = data

                    await Performance.update({ 'balls_faced': ballsFaced, 'run_scored': runsScored, 'fours_hit': foursHit, 'sixes_hit': sixesHit, 'batting_strikerate': strikeRate, 'out_status': outStatus, out_comment: outType.outComment }, { where: { player_id: playerAPIId, m_id: match.id }, raw: true })
                }))
            }

            // Bowling
            if (innings_one.length && innings_two.length) {
                await bowling_one.map(data => data.team.map(async data => {
                    const { playerAPIId, oversBowled, runsGiven, maidensBowled, noBallsBowled, widesBowled, wicketsTaken, bowledMade, lbwMade, economy } = data
                    await Performance.update({ 'overs_bowled': oversBowled, 'runs_given': runsGiven, 'mainens_bowled': maidensBowled, 'noballs_bowled': noBallsBowled, 'wides_bowled': widesBowled, 'wickets_taken': wicketsTaken, 'bowled_made': bowledMade, 'lbw_made': lbwMade, 'economy': economy }, { where: { player_id: playerAPIId, m_id: match.id }, raw: true })
                }))
                await bowling_two.map(data => data.team.map(async data => {
                    const { playerAPIId, oversBowled, runsGiven, maidensBowled, noBallsBowled, widesBowled, wicketsTaken, bowledMade, lbwMade, economy } = data
                    await Performance.update({ 'test_overs_bowled': oversBowled, 'test_runs_given': runsGiven, 'test_mainens_bowled': maidensBowled, 'test_noballs_bowled': noBallsBowled, 'test_wides_bowled': widesBowled, 'test_wickets_taken': wicketsTaken, 'test_bowled_made': bowledMade, 'test_lbw_made': lbwMade, 'test_economy': economy }, { where: { player_id: playerAPIId, m_id: match.id }, raw: true })
                }))
            }
            else { // Other then TEST
                await bowling.map(data => data.team.map(async data => {
                    const { playerAPIId, oversBowled, runsGiven, maidensBowled, noBallsBowled, widesBowled, wicketsTaken, bowledMade, lbwMade, economy } = data
                    await Performance.update({ 'overs_bowled': oversBowled, 'runs_given': runsGiven, 'mainens_bowled': maidensBowled, 'noballs_bowled': noBallsBowled, 'wides_bowled': widesBowled, 'wickets_taken': wicketsTaken, 'bowled_made': bowledMade, 'lbw_made': lbwMade, 'economy': economy }, { where: { player_id: playerAPIId, m_id: match.id }, raw: true })
                }))
            }

            // Fielding
            if (innings_one.length && innings_two.length) {
                await fielding_one.map(data => data.team.map(async data => {
                    const { fielder_id, fielder_name, catches, runout_thrower, runout_catcher, runout_direct_hit, stumping } = data
                    await Performance.update({ 'runout_thrower': runout_thrower, 'runout_catcher': runout_catcher, 'runout_direct_hit': runout_direct_hit, 'catches': catches, 'stumping': stumping }, { where: { player_id: fielder_id, m_id: match.id } })
                }))
                await fielding_two.map(data => data.team.map(async data => {
                    const { fielder_id, fielder_name, catches, runout_thrower, runout_catcher, runout_direct_hit, stumping } = data
                    await Performance.update({ 'test_runout_thrower': runout_thrower, 'test_runout_catcher': runout_catcher, 'test_runout_direct_hit': runout_direct_hit, 'test_catches': catches, 'test_stumping': stumping }, { where: { player_id: fielder_id, m_id: match.id } })
                }))
            }
            else { // Other then TEST
                await fielding.map(data => data.team.map(async data => {
                    const { fielder_id, fielder_name, catches, runout_thrower, runout_catcher, runout_direct_hit, stumping } = data
                    await Performance.update({ 'runout_thrower': runout_thrower, 'runout_catcher': runout_catcher, 'runout_direct_hit': runout_direct_hit, 'catches': catches, 'stumping': stumping }, { where: { player_id: fielder_id, m_id: match.id } })
                }))
            }

            // console.log(lineup.length, match.series_id, 'jhh')
            const pts = await getuserPlayerPoints(lineup, match.series_id, match.id)
            // console.log(pts.length)
            await pts?.map(async pts => {
                await Performance.update({ 'player_points': Object.values(pts)[0] }, { where: { 'player_id': Object.keys(pts)[0], m_id: match.id } })
            })


            // FOR TEST MATCH

            /* const performance_points = await Performance.findAll({
                where: { 'm_id': match.id }
            })

            for (let e of performance_points) {
                // console.log(score.data.fixtureType)
                if (score.data.fixtureType.toLowerCase() == 'test') {
                    await Performance.update({ 'total_points': (e.player_points + e.test_player_points) }, { where: { 'id': e.id } })
                }
                else {
                    console.log(e.player_points, e.id)
                    await Performance.update({ 'total_points': (e.player_points) }, { where: { 'id': e.id } })
                }
            } */
        })
    }
    catch (error) {
        console.log(error.message)
    }
}

//refund declaration
const getLiveScore = async () => {

    try {
        const fixtures = await Fixtures.findAll({ where: { status: 'live', active: 1 }, raw: true })

        const matchIdList = await fixtures.map(data => data)

        // const total_data = []

        matchIdList.map(async match => {
            const score = await fetch(`http://13.56.135.148:8080/api/v1/scorecard/${match.m_id}`).then(response => response.json())
            // console.log(score?.data)
            const teamKeys = score?.data?.teams ? Object?.keys(score?.data?.teams) : []
            const innings = score?.data?.innings
            // const { scores_full, scores } = score?.data?.teams
            const tot_score = teamKeys?.map(key => score.data.teams[key])
            const wonTeamId = score?.data?.toss
            const teamIdList = teamKeys?.map(key => score.data.teams[key].teamAPIId)
            const score_card = await Scorecard.findAll({
                where: {
                    match_id: match.id
                }
            })
            const full_scorecard = await Full_scorecard.findAll({
                where: {
                    match_id: match.id
                }
            })
            // console.log(score_card.length, 'sad');
            if (!full_scorecard.length) {
                await Full_scorecard.create({
                    match_id: match.id,
                    score_card: score
                })
            } else {
                await Full_scorecard.update({
                    score_card: score
                }, {
                    where: { match_id: match.id }
                })
            }

            if (!score_card.length) {
                teamIdList.map(async id => {
                    tot_score.map(async total => {
                        if (id === total.teamAPIId) {
                            await Scorecard.create({ toss_won: 0, total_score: total.scores_full, wides: 0, noballs: 0, extras: 0, winning_id: 0, winning_comment: '', team_id: id, match_id: match.id })
                        }
                    })
                })
            } else {
                innings?.map(async (inn, i) => {
                    const { scores_full, teamAPIId } = score.data.teams[teamKeys[i]]
                    const { byes, legbyes, wides, noballs, penalty, total } = inn.extras

                    await Scorecard.update({ toss_won: (wonTeamId === teamAPIId ? 1 : 0), total_score: scores_full, byes: byes, legbyes: legbyes, wides: wides, noballs: noballs, extras: total, winning_id: 0, winning_comment: score.data.fixtureStatusNote ? score.data.fixtureStatusNote : score.data?.toss?.text }, { where: { 'team_id': teamAPIId, 'match_id': match.id } })
                })
            }
            // teamIdList.map(async id => {
            //     tot_score.map(async total => {
            //         if (id === total.teamAPIId) {
            //             await Scorecard.update({ toss_won: 0, total_score: total.scores_full, wides: 0, noballs: 0, extras: 0, winning_id: 0, winning_comment: '' }, { where: { 'team_id': id, 'match_id': match.id } })
            //         }
            //     })
            // })

            // innings?.map(async (inn, i) => {
            //     const { scores_full, teamAPIId } = score.data.teams[teamKeys[i]]
            //     const { byes, legbyes, wides, noballs, penalty, total } = inn.extras

            //     await Scorecard.update({ toss_won: (wonTeamId === teamAPIId ? 1 : 0), total_score: scores_full, byes: byes, legbyes: legbyes, wides: wides, noballs: noballs, extras: total, winning_id: 0, winning_comment: score.data.fixtureStatusNote ? score.data.fixtureStatusNote : score.data?.toss?.text }, { where: { 'team_id': teamAPIId, 'match_id': match.id } })
            // })
        })

        // for (let i = 0; i < matchIdList.length; i++) {
        //     total_data.push(await fetch(`http://13.56.135.148:8080/api/v1/scorecard/${matchIdList[i]}`).then(response => response.json()))
        // }

        const breakup = []
        const breakup_details = []
        const breakup_count = []
        for (let i = 0; i < fixtures.length; i++) {
            const data = await Join_contest.findAll({
                where: { fixture_id: fixtures[i].id },
                include: [{
                    model: Contests
                    , include: [Match_contest]
                }]
            })
            data.length && breakup.push(...data)
        }

        const unique = [... new Set(breakup.map(x => x.contest_id))];

        for (let j = 0; j < unique.length; j++) {
            const data = await Upcoming_breakup.findAll({
                where: { contest_id: unique[j] },
                attributes: ['fixture_id', 'contest_id', 'name', 'start', 'end', 'prize', 'percentage']
            })
            data.length && breakup_details.push(...data)
        }

        const prize_caluculation = (original_size, size, prize) => {
            const get_size = Math.round((size / original_size) * 100)
            console.log(get_size);
            return (
                (get_size / 100) * prize
            )
        }

        const refund_contest = []
        const refund_users = []

        breakup.map(e => {
            if (breakup.filter(j => j.contest_id === e.contest_id).length < e.contest.min_contest_size) {
                refund_contest.push(e.contest_id)
                refund_users.push(e)
            }
        })

        const Live_unique = [... new Set(breakup_details.map(x => x.contest_id))];
        const data = []

        // res.status(200).json({
        //     data: breakup
        // })


        const Liv = breakup_details.map(async e => {
            if (refund_contest.indexOf(e.contest_id) !== -1) {
                data.push({
                    fixture_id: e.fixture_id,
                    contest_id: e.contest_id,
                    name: e.name,
                    winning_amount: prize_caluculation(
                        breakup.find(j => j.contest.id === e?.contest_id).contest.contest_size,
                        breakup.filter(j => j.contest_id === e?.contest_id)?.length,
                        breakup.find(j => j.contest.id === e?.contest_id).contest.winning_amount
                    ),
                    size: breakup.filter(j => j.contest_id === e.contest_id)?.length,
                    start: e.start,
                    end: e.end,
                    prize: (prize_caluculation(breakup.find(j => j.contest.id === e.contest_id).contest.entry_fee, breakup.filter(j => j.contest_id === e.contest_id)?.length, breakup.find(j => j.contest.id === e.contest_id).contest.winning_amount) * e.percentage) / 100,
                    percentage: e.percentage,
                })
            }
        })

        for (let i = 0; i < Live_unique.length; i++) {
            const data = []
            const checker = await Live_breakup.findAll({})
            if (!checker.filter(e => e.contest_id === Live_unique[i]).length) {
                const liv = await Live_breakup.bulkCreate(breakup_details.filter(e => e.contest_id === Live_unique[i]).map(p => {
                    return {
                        fixture_id: p.fixture_id,
                        contest_id: p.contest_id,
                        name: p.name,
                        winning_amount: prize_caluculation(
                            breakup.find(j => j.contest.id === p?.contest_id).contest.contest_size,
                            breakup.filter(j => j.contest_id === p?.contest_id)?.length,
                            breakup.find(j => j.contest.id === p?.contest_id).contest.winning_amount),
                        size: breakup.filter(j => j.contest_id === p?.contest_id)?.length,
                        start: p.start,
                        end: p.end,
                        prize: (prize_caluculation(
                            breakup.find(j => j.contest.id === p?.contest_id).contest.contest_size,
                            breakup.filter(j => j.contest_id === p?.contest_id)?.length,
                            breakup.find(j => j.contest.id === p?.contest_id).contest.winning_amount) * p.percentage) / 100,
                        percentage: p?.percentage,
                    }
                }))
            }
        }

        const cancelled_match = [... new Set(refund_contest.map(x => x))];

        if (refund_users.length) {
            for (let i = 0; i < refund_users.length; i++) {
                if (refund_users[i].contest?.match_contests[0].is_cancelled !== 1) {
                    // if (refund_users.contest?.match_contests[0]) {
                    await Transactions.create({
                        user_id: refund_users[i].user_id,
                        txn_amount: refund_users[i].contest.entry_fee ? refund_users[i].contest.entry_fee : 0,
                        trans_type_id: 6,
                        txn_id: `DPL${Date.now()}`,
                        txn_date: Date.now()
                    })
                    await Users.increment({
                        cash_balance: refund_users[i].contest.entry_fee,
                    }, {
                        where: {
                            id: refund_users[i].user_id
                        }
                    })
                    // await Notifications.create({
                    //     user_id: refund_users[i].user_id,
                    //     notification_type: 6,
                    //     title: 'REFUND',
                    //     notification: 'contest is cancelled',
                    //     match_id: refund_users[i].fixture_id,
                    //     date: Date()
                    // })   
                    // }
                }
            }
            for (let j = 0; j < cancelled_match.length; j++) {
                const data = refund_users.filter(e => e.contest.match_contests[0].contest_id === cancelled_match[j])
                // if (data.contest?.match_contests[0].id) {
                await Match_contest.update({
                    is_cancelled: 1
                }, {
                    where: {
                        id: data[0].contest?.match_contests[0].id
                    }
                })
                // }
            }
        }

    }
    catch (error) {
        console.log(error)
    }
}

// winning declaration
const update_team_points = async () => {
    try {
        ///live fixture
        const start = Date.now()
        console.log('timer_start', start)
        const fixtures = await Fixtures.findAll({ where: { status: 'live', active: 1 }, raw: true })
        const matchIdList = await fixtures.map(data => data.m_id)
        var joined_contest = []

        for (const match of fixtures) {
            const result = await Join_contest.findAll({
                where: {
                    fixture_id: match.id
                },
                include: [{
                    model: CaptainViceCaptain,
                    include: [UserTeam]
                }]
            })
            joined_contest.push(...result)
        }

        await joined_contest.map(async e => {
            const players = await JSON.parse(JSON.stringify(e.userteam_cap_vice.userteams))
            const captain = JSON.parse(JSON.stringify(e.userteam_cap_vice)).captain_id
            const vice_captain = JSON.parse(JSON.stringify(e.userteam_cap_vice)).viceCaptain_id
            const point_system = await PointSystem.findAll({ raw: true })
            const pointList = []
            await players.map(async player => {
                const points = await Performance.findAll({ where: { 'm_id': player.match_id, 'player_id': player.player_id }, raw: true })
                let sum = 0
                let count = 0
                pointList.push(points[0])
                pointList.forEach(num => {
                    count++
                    if (num) {
                        if (num.player_id === captain) {
                            sum += (+num.player_points * 2)                           
                        }
                        else if (num.player_id === vice_captain) {
                            sum += (+num.player_points * 1.5)
                        }
                        else {
                            sum += (+num.player_points)
                        }
                    }

                })    
                if (count == 11) {
                    console.log(sum, e.player_team_id, 'lll')
                    await Join_contest.update({ 'player_points': sum }, { where: { 'player_team_id': e.player_team_id } })
                }
            })

        })
        await update_team_rank()

        // /completed fixture
        const total_data = []

        for (let i = 0; i < matchIdList.length; i++) {
            total_data.push(await fetch(`http://13.56.135.148:8080/api/v1/scorecard/${matchIdList[i]}`).then(response => response.json()))
        }

        const completed_fixtures = []

        for (let i = 0; i < total_data.length; i++) {
            if (total_data[i]?.data?.fixtureStatus?.toLowerCase() === 'completed') {
                completed_fixtures.push(total_data[i])
            }
        }

        const fetch_id = completed_fixtures.map(e => e?.data?.fixtureAPIId)
        const fetch_fixture = await Fixtures.findAll({
            where: {
                'm_id': { [Op.in]: [fetch_id] },
                'active': 1
            }
        })

        // grouping
        /* for (let i = 0; i < fetch_fixture.length; i++) {
            const fetch_contest = await Match_contest.findAll(({
                where: {
                    fixture_id: fetch_fixture[i].id
                }
            }))
            const contest_id = await fetch_contest.filter(e => e.is_cancelled === 0).map(j => j.contest_id)
            await group_filling(fetch_fixture[i].id, contest_id)
        } */

        const tester = []
        //winning declaration

        if (completed_fixtures.length) {
            const breakup = []
            const breakup_details = []

            for (let i = 0; i < completed_fixtures.length; i++) {
                const data = await Join_contest.findAll({
                    where: { fixture_id: fetch_fixture[i]?.id },
                    include: [{
                        model: Contests,
                        include: [Match_contest]
                    }]
                })
                data.length && breakup.push(...data)
            }

            const fetch_unique_break = [... new Set(breakup.map(x => x.contest_id))]

            for (let j = 0; j < fetch_unique_break.length; j++) {
                data_un = await Live_breakup.findAll({
                    where: { contest_id: fetch_unique_break[j] },
                    attributes: ['fixture_id', 'contest_id', 'name', 'start', 'end', 'prize', 'percentage', 'id']
                })
                data_un.length && breakup_details.push(...data_un)
            }

            const complete_total_data = total_data.filter(e => e.data.fixtureStatus?.toLowerCase() === 'completed')

            tester.push(breakup_details)
            for (let i = 0; i < complete_total_data.length; i++) {                                                
                if (complete_total_data[i]?.data?.fixtureStatus?.toLowerCase() === 'completed') {               
                    const filter_con = breakup.filter(fix => (fix.fixture_id === fetch_fixture[i].id))
                    const unique = [... new Set(filter_con.map(x => x.contest_id))];                   
                    for (let j = 0; j < unique.length; j++) {                        
                        const fetch_breakup = breakup_details.filter(e => e.contest_id === unique[j])  
                        const ender = fetch_breakup[fetch_breakup.length - 1].end         
                        for (let prize = 0; prize < fetch_breakup.length; prize++) { 
                            for (let p = fetch_breakup[prize].start; p <= fetch_breakup[prize].end; p++) {
                                const data = await breakup.filter(fil => (fil.contest_id === unique[j] && fil.current_rank === prize))
                                let looper = breakup.filter(fil => (fil.contest_id === unique[j] && fil.current_rank === p)).length       
                                // console.log('looper_checker', p);    
                                // console.log(breakup.filter(fil => (fil.contest_id === unique[j] && fil.current_rank === p)).length === 1, 'p-test')
                                if (breakup.filter(fil => (fil.contest_id === unique[j] && fil.current_rank === p)).length === 1) {
                                    console.log(p, 'lll')
                                    /* await Users.increment({
                                        winning_amount: fetch_breakup[prize].prize,
                                    }, {
                                        where: {
                                            id: breakup.filter(fil => (fil.contest_id === unique[j] && fil.current_rank === p))[0]?.user_id
                                        }
                                    })
                                    await Transactions.create({
                                        user_id: breakup.filter(fil => (fil.contest_id === unique[j] && fil.current_rank === p))[0]?.user_id,
                                        txn_amount: fetch_breakup[prize].prize,
                                        trans_type_id: 2,
                                        txn_date: Date(),
                                        txn_id : 'DPL' + Date.now()
                                    }) */
                                    // await Join_contest.update({
                                    //     winning_amount: fetch_breakup[prize].prize,
                                    //     status:1
                                    // }, {
                                    //     where: {
                                    //         [Op.and]: [
                                    //             { fixture_id: fetch_breakup[prize].fixture_id },
                                    //             { contest_id: fetch_breakup[prize].contest_id },
                                    //             { position: p }
                                    //         ]
                                    //     }
                                    // })
                                    // await Notifications.create({
                                    //     user_id: breakup.filter(fil => (fil.contest_id === unique[j] && fil.current_rank === p))[0]?.user_id,
                                    //     notification_type: 5,
                                    //     title: 'Winning Prize',
                                    //     notification: `you won prize ${Math.trunc(fetch_breakup[prize].prize)}`,
                                    //     match_id : fetch_breakup[prize].fixture_id,
                                    //     date: Date()
                                    // })
                                } else {
                                    // looper++
                                    let priz = 0
                                    let prize_val = p
                                    for (let dup = 0; dup < looper; dup++) {
                                        if (prize_val <= ender) {
                                            priz = Number(fetch_breakup[prize].prize) + priz                                            
                                            // console.log(prize_val,p , ender, 'dsaasd', priz);
                                        }
                                        prize_val++
                                        // console.log('++', fetch_breakup[prize]);
                                    }
                                    // console.log('prize', ender, fetch_breakup[prize].end, p, prize_val, looper);
                                    for (let dup = 0; dup < looper; dup++) {
                                        // console.log('down', p, looper);
                                       /*  await Users.increment({
                                            winning_amount: (priz / looper),
                                        }, {
                                            where: {
                                                // id: { [Op.in]: data.map(e => e.id) },
                                                id: breakup.filter(fil => (fil.contest_id === unique[j] && fil.position === p))[0]?.user_id
                                            }
                                        })
                                        await Transactions.create({
                                            user_id: breakup.find(e => (e.contest_id === unique[j] && e.position === p)).user_id,
                                            txn_amount: (priz / looper),
                                            trans_type_id: 2,
                                            txn_date: Date(),
                                            txn_id : 'DPL' + Date.now()
                                        }) */
                                        // await Join_contest.update({
                                        //     winning_amount: (priz / looper),
                                        //     status:1
                                        // }, {
                                        //     where: {
                                        //         [Op.and]: [
                                        //             { fixture_id: fetch_breakup[prize].fixture_id },
                                        //             { contest_id: fetch_breakup[prize].contest_id },
                                        //             { position: p }
                                        //         ]
                                        //     }
                                        // })
                                        // await Notifications.create({
                                        //     user_id: breakup.filter(fil => (fil.contest_id === unique[j] && fil.position === p))[0]?.user_id,
                                        //     notification_type: 5,
                                        //     title: 'Winning Prize',
                                        //     notification: `you won prize ${Math.trunc(fetch_breakup[prize].prize)}`,
                                        //     match_id : fetch_breakup[prize].fixture_id,
                                        //     date: Date()
                                        // })
                                        p++
                                        // console.log('wrong', p);                              
                                    }
                                    p--
                                    // console.log('last', p);   
                                }
                            }
                        }
                    }
                }
            }
        }

        // res.status(200).json({
        //     data: tester
        // })

        /////// fixture status
        for (let i = 0; i < completed_fixtures.length; ++i) {
            // await Fixtures.update({ status: 'completed' }, { where: { 'm_id': completed_fixtures[i].data.fixtureAPIId } })
        }
        console.log('timer_end', Date.now() - start)
    }
    catch (error) {
        console.log(error)
    }
}

// const update_team_rank = async () => {
//     try {
//         const fixtures = await Fixtures.findAll({ where: { status: 'live', active: 1 }, raw: true })
//         var joined_contest = []

//         for (const match of fixtures) {
//             const result = await Join_contest.findAll({
//                 where: {
//                     fixture_id: match.id
//                 },
//                 // include: [{
//                 //     model: CaptainViceCaptain,
//                 //     include: [UserTeam]
//                 // }]
//             })
//             joined_contest.push(...result)
//         }

//         const datas = joined_contest.reduce((prev, next) => {
//             prev[next.contest_id] = prev[next.contest_id] || [];
//             prev[next.contest_id].push(next);
//             return prev;
//         }, Object.create(null))

//         const contest_key = Object.keys(datas)
//         contest_key.map(key => {
//             var arr = []
//             datas[key].map(async e => {
//                 if (key == e.contest_id) {
//                     // console.log(key, 'key', e.contest_id, 'id')
//                     arr.push(e)
//                     arr.sort((a, b) => {
//                         return b.player_points - a.player_points
//                     })

//                     var previous_points = 0
//                     var previous_rank = 0
//                     var position = 0
//                     for (let i of arr) {
//                         if (i.player_points == previous_points) {
//                             i.rank = previous_rank
//                             position++
//                         }
//                         else {
//                             i.rank = position + 1
//                             previous_points = i.player_points
//                             previous_rank = i.rank
//                             position++
//                         }
//                         // console.log(previous_rank, i.current_rank, position)
//                         await Join_contest.update({ 'current_rank': previous_rank, 'previous_rank': i.current_rank, 'position': position }, { where: { 'contest_id': e.contest_id, 'player_team_id': i.player_team_id } })
//                     }
//                 }
//                 // console.log(JSON.parse(JSON.stringify(arr)).length)
//             })
//         })
//         // res.status(200).json({ data: datas[1] })
//     }
//     catch (error) {
//         console.log(error.message)
//         // res.status(200).json({ data: error.message })
//     }
// }

const update_team_rank = async () => {
    try {
        const fixtures = await Fixtures.findAll({ where: { status: 'live', active: 1 }, raw: true })
        var joined_contest = []
 
        for (const match of fixtures) {
            const result = await Join_contest.findAll({
                where: {
                    fixture_id: match.id
                },
            })
            joined_contest.push(...result)
        }
 
        const datas = await joined_contest.reduce((prev, next) => {
            prev[next.fixture_id] = prev[next.fixture_id] || [];
            prev[next.fixture_id].push(next);
            return prev;
        }, Object.create(null))
 
        const fixture_id = Object.keys(datas)
 
        fixture_id.map(async id => {
            const data = await sequelize.query(`SELECT *, rank() OVER ( partition by contest_id order by player_points desc ) AS 'rank' FROM join_contests WHERE fixture_id = ${id};`)
           
            const contests = await data[0].reduce((prev, next) => {
                prev[next.contest_id] = prev[next.contest_id] || [];
                prev[next.contest_id].push(next);
                return prev;
            }, Object.create(null))
 
            const contest_key = Object.keys(contests)
            
            contest_key.map(async key => {
                contests[key].map(async (team, pos) => {
                    await Join_contest.update({ current_rank: team.rank, position: pos + 1 }, { where: { id: team.id } })
                })
            })
 
            const prev_contest = await Join_contest.findAll({ where: { fixture_id: id } })
            prev_contest.map(async e => {
                // console.log(JSON.parse(JSON.stringify(e)))
                await Join_contest.update({previous_rank:e.current_rank},{where:{id:e.id}})
            })
        })
 
 
 
    //    await res.status(200).json({ data: datas})
    }
    catch (error) {
        console.log(error)
        // res.status(200).json({ data: error.message })
    }
}


module.exports = {
    getSeriesSportsData,
    getFixturesSportsData,
    getTeamsSportsData,
    getSquadSportsData,
    getLineUpSquads,
    getPerformanceSquad,
    getLiveScoreSportsData,
    getLiveScore,
    update_team_points,
    update_team_rank,
    getzquadSportsData
}
